import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';

import { Address } from '../../shared/entities';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dtos/create-address.dto';
import { UpdateAddressDto } from './dtos/update-address.dto';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva dirección' })
  @ApiResponse({ status: 201, description: 'Dirección creada', type: Address })
  async create(@Body() dto: CreateAddressDto): Promise<Address> {
    return this.addressService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una dirección existente' })
  @ApiResponse({ status: 200, description: 'Dirección actualizada', type: Address })
  async update(@Param('id') id: string, @Body() dto: UpdateAddressDto): Promise<Address> {
    return this.addressService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una dirección por ID' })
  @ApiResponse({ status: 204, description: 'Dirección eliminada' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.addressService.remove(id);
  }
}
