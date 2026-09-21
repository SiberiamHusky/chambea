import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Address } from '../../shared/entities';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '../../exceptions';
import { CreateAddressDto } from './dtos/create-address.dto';
import { UpdateAddressDto } from './dtos/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(dto: CreateAddressDto): Promise<Address> {
    try {
      const address = this.addressRepository.create(dto);
      return await this.addressRepository.save(address);
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async findAll(): Promise<Address[]> {
    try {
      return await this.addressRepository.find();
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async findOne(id: string): Promise<Address> {
    try {
      const address = await this.addressRepository.findOne({ where: { address_id: id } });
      if (!address) {
        throw new NotFoundException({ message: 'Address not found' });
      }
      return address;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async update(id: string, dto: UpdateAddressDto): Promise<Address> {
    try {
      const address = await this.findOne(id);
      Object.assign(address, dto);
      return await this.addressRepository.save(address);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.addressRepository.delete({ address_id: id });
      if (result.affected === 0) {
        throw new NotFoundException({ message: 'Address not found' });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }
}
