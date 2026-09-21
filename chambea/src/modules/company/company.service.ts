import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Address, Company } from '../../shared/entities';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '../../exceptions';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(dto: CreateCompanyDto): Promise<Company> {
    try {
      // Normalizar RIF en mayúsculas
      dto.company_rif = dto.company_rif.toUpperCase();

      // Validar dirección existente
      const address = await this.addressRepository.findOne({ where: { address_id: dto.company_address_id } });
      if (!address) {
        throw new NotFoundException({ message: 'Address not found' });
      }

      const company = this.companyRepository.create({ ...dto, company_address: address });
      return await this.companyRepository.save(company);
    } catch (error: any) {
      // Uniq violation
      if (error?.code === '23505') {
        throw new BadRequestException({ message: 'El RIF ya está registrado' });
      }
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async findAll(): Promise<Company[]> {
    try {
      return await this.companyRepository.find();
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async findOne(id: string): Promise<Company> {
    try {
      const company = await this.companyRepository.findOne({ where: { company_id: id } });
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

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    try {
      const company = await this.findOne(id);

      if (dto.company_rif) {
        dto.company_rif = dto.company_rif.toUpperCase();
      }

      if (dto.company_address_id) {
        const address = await this.addressRepository.findOne({ where: { address_id: dto.company_address_id } });
        if (!address) {
          throw new NotFoundException({ message: 'Address not found' });
        }
        company.company_address = address;
      }

      Object.assign(company, dto);
      return await this.companyRepository.save(company);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new BadRequestException({ message: 'El RIF ya está registrado' });
      }
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.companyRepository.delete({ company_id: id });
      if (result.affected === 0) {
        throw new NotFoundException({ message: 'Company not found' });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }
}
