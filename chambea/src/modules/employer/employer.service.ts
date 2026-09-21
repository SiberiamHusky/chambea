import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Address, Company } from '../../shared/entities';
import { CreateCompanyDto, CreateEmployerDto, EmployerUpdateCompanyDto, UpdateEmployerDto } from './dtos';
import { Employer } from './employer.entity';
import { UserQueryService } from '../user/user.query.service';

import { AddressService } from '../address/address.service';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '../../exceptions';
import { CompanyService } from '../company/company.service';
import { UpdateCompanyDto } from '../company/dtos/update-company.dto';
import { EmployerType } from '../../shared/enums';

@Injectable()
export class EmployerService {
  constructor(
    @InjectRepository(Employer)
    private readonly employerRepository: Repository<Employer>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly userQueryService: UserQueryService,
    // servicios canónicos
    private readonly companyService: CompanyService,
    private readonly addressService: AddressService,
  ) {}

  async create(createEmployerDto: CreateEmployerDto): Promise<Employer> {
    try {
      // Verificar que el usuario existe
      const user = await this.userQueryService.findById(createEmployerDto.user_id);
      if (!user) {
        throw new NotFoundException({ message: 'User not found' });
      }

      // Verificar que el usuario no sea ya un employer
      const existingEmployer = await this.employerRepository.findOne({
        where: { user: { _id: createEmployerDto.user_id } },
      });
      if (existingEmployer) {
        throw BadRequestException.RESOURCE_ALREADY_EXISTS('User is already an employer');
      }

      // Si se proporciona company_id, verificar que la empresa existe
      if (createEmployerDto.company_id) {
        const company = await this.companyRepository.findOne({
          where: { company_id: createEmployerDto.company_id },
        });
        if (!company) {
          throw new NotFoundException({ message: 'Company not found' });
        }
      }

      const employer = this.employerRepository.create({
        user,
        employer_type: createEmployerDto.employer_type,
        company: createEmployerDto.company_id ? { company_id: createEmployerDto.company_id } : null,
        bio: createEmployerDto.bio,
        years_as_employer: createEmployerDto.years_as_employer,
        is_verified: false,
      });

      return await this.employerRepository.save(employer);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async findAll(): Promise<Employer[]> {
    try {
      return await this.employerRepository.find({
        relations: ['user', 'company', 'company.company_address'],
      });
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async findOne(id: string): Promise<Employer> {
    try {
      const employer = await this.employerRepository.findOne({
        where: { employer_id: id },
        relations: ['user', 'company', 'company.company_address'],
      });

      if (!employer) {
        throw new NotFoundException({ message: 'Employer not found' });
      }

      return employer;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async findByUserId(userId: string): Promise<Employer> {
    try {
      const employer = await this.employerRepository.findOne({
        where: { user: { _id: userId } },
        relations: ['user', 'company', 'company.company_address'],
      });

      if (!employer) {
        throw new NotFoundException({ message: 'Employer not found for this user' });
      }

      return employer;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async update(id: string, updateEmployerDto: UpdateEmployerDto): Promise<Employer> {
    try {
      const employer = await this.findOne(id);

      // Si se actualiza company_id, verificar que la empresa existe
      if (updateEmployerDto.company_id) {
        const company = await this.companyRepository.findOne({
          where: { company_id: updateEmployerDto.company_id },
        });
        if (!company) {
          throw new NotFoundException({ message: 'Company not found' });
        }
        employer.company = company;
      }

      // Actualizar campos
      if (updateEmployerDto.employer_type !== undefined) {
        employer.employer_type = updateEmployerDto.employer_type;
      }
      if (updateEmployerDto.bio !== undefined) {
        employer.bio = updateEmployerDto.bio;
      }
      if (updateEmployerDto.years_as_employer !== undefined) {
        employer.years_as_employer = updateEmployerDto.years_as_employer;
      }
      if (updateEmployerDto.is_verified !== undefined) {
        employer.is_verified = updateEmployerDto.is_verified;
      }

      return await this.employerRepository.save(employer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const employer = await this.findOne(id);
      await this.employerRepository.remove(employer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  // Métodos para gestión de empresas
  async createCompany(createCompanyDto: CreateCompanyDto, userId?: string): Promise<Company> {
    try {
      // Crear dirección si se proporciona usando AddressService
      let addressId: string | undefined;
      if (createCompanyDto.company_address) {
        const createdAddress = await this.addressService.create(createCompanyDto.company_address as any);
        addressId = createdAddress.address_id;
      }

      // Delegar a CompanyService con DTO canónico
      const company = await this.companyService.create({
        company_name: createCompanyDto.company_name,
        company_rif: createCompanyDto.company_rif,
        company_description: createCompanyDto.company_description,
        company_website: createCompanyDto.company_website,
        company_phone: createCompanyDto.company_phone,
        company_email: createCompanyDto.company_email,
        industry: createCompanyDto.industry,
        company_size: createCompanyDto.company_size,
        employee_count: createCompanyDto.employee_count,
        founded_year: createCompanyDto.founded_year,
        company_logo_url: createCompanyDto.company_logo_url,
        company_address_id: addressId,
      } as any);

      // Si tenemos userId, asociar la empresa al employer del usuario
      if (userId) {
        try {
          const employer = await this.findByUserId(userId);
          employer.company = company;
          employer.company_id = (company as any).company_id;
          employer.employer_type = EmployerType.COMPANY;
          await this.employerRepository.save(employer);
        } catch (e) {
          // Si no existe employer para este usuario, mantener la creación de la empresa sin asociación
          // y propagar como error controlado si es necesario.
          if (e instanceof NotFoundException) {
            // No hay employer para el usuario; simplemente retornamos la company creada.
          } else {
            throw e;
          }
        }
      }

      return company;
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async updateCompany(id: string, updateData: EmployerUpdateCompanyDto): Promise<Company> {
    try {
      const company = await this.companyService.findOne(id);

      // Actualizar/crear dirección si se proporciona usando AddressService
      let { company_address_id } = updateData;
      if (updateData.company_address) {
        if (company.company_address) {
          await this.addressService.update(company.company_address.address_id, updateData.company_address as any);
          company_address_id = company.company_address.address_id;
        } else {
          const newAddress = await this.addressService.create(updateData.company_address as any);
          company_address_id = newAddress.address_id;
        }
      }

      const dto: UpdateCompanyDto = {
        company_name: updateData.company_name,
        company_rif: updateData.company_rif,
        company_description: updateData.company_description,
        company_website: updateData.company_website,
        company_phone: updateData.company_phone,
        company_email: updateData.company_email,
        industry: updateData.industry,
        company_size: updateData.company_size,
        employee_count: updateData.employee_count,
        founded_year: updateData.founded_year,
        company_logo_url: updateData.company_logo_url,
        company_address_id,
      };

      return await this.companyService.update(id, dto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async findAllCompanies(): Promise<Company[]> {
    try {
      return await this.companyRepository.find({
        relations: ['company_address'],
      });
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async findCompany(id: string): Promise<Company> {
    try {
      const company = await this.companyRepository.findOne({
        where: { company_id: id },
        relations: ['company_address'],
      });

      if (!company) {
        throw new NotFoundException({ message: 'Company not found' });
      }

      return company;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  // legacy updateCompany removed; now delegated to CompanyService via the earlier implementation.

  async removeCompany(id: string): Promise<void> {
    try {
      const company = await this.findCompany(id);

      // Verificar que no hay employers asociados a esta empresa
      const employersCount = await this.employerRepository.count({
        where: { company: { company_id: id } },
      });

      if (employersCount > 0) {
        throw BadRequestException.RESOURCE_ALREADY_EXISTS('Cannot delete company with associated employers');
      }

      await this.companyRepository.remove(company);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  // Vincular una empresa existente al employer de un usuario
  async attachCompanyForUser(userId: string, companyId: string): Promise<Employer> {
    try {
      const employer = await this.findByUserId(userId);
      const company = await this.companyRepository.findOne({ where: { company_id: companyId } });
      if (!company) {
        throw new NotFoundException({ message: 'Company not found' });
      }
      employer.company = company;
      employer.company_id = company.company_id as any;
      employer.employer_type = EmployerType.COMPANY;
      return await this.employerRepository.save(employer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }
}
