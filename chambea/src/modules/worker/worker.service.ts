import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserType } from '../../shared/enums';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { CreateWorkerProfileDto } from './dtos/create-worker-profile.dto';
import { UpdateWorkerProfileDto } from './dtos/update-worker-profile.dto';
import { UserQueryService } from '../user/user.query.service';
import { Worker } from './worker.entity';

@Injectable()
export class WorkerService {
  constructor(
    @InjectRepository(Worker)
    private readonly workerRepository: Repository<Worker>,
    private readonly userQueryService: UserQueryService,
  ) {}

  async createWorkerProfile(userId: string, dto: CreateWorkerProfileDto): Promise<Worker> {
    const user = await this.userQueryService.findById(userId);

    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }
    if (user.user_type !== UserType.WORKER) {
      throw new BadRequestException('El usuario no es de tipo worker.');
    }

    const worker = this.workerRepository.create({
      ...dto,
      identity_verified_status: false,
      user,
    });

    await this.workerRepository.save(worker);

    return worker;
  }

  async findByUserId(userId: string): Promise<Worker> {
    const worker = await this.workerRepository.findOne({
      where: { user: { _id: userId } },
      relations: ['user'],
    });
    if (!worker) {
      throw new NotFoundException('Perfil de trabajador no encontrado para este usuario.');
    }
    return worker;
  }

  async updateMyProfile(userId: string, dto: UpdateWorkerProfileDto): Promise<Worker> {
    const worker = await this.workerRepository.findOne({
      where: { user: { _id: userId } },
      relations: ['user'],
    });
    if (!worker) {
      throw new NotFoundException('Perfil de trabajador no encontrado para este usuario.');
    }

    // Actualización parcial por campos definidos
    if (dto.bio !== undefined) worker.bio = dto.bio;
    if (dto.years_of_experience !== undefined) worker.years_of_experience = dto.years_of_experience as number;
    if (dto.availability_status !== undefined) worker.availability_status = dto.availability_status as string;
    if (dto.rate_type !== undefined) worker.rate_type = dto.rate_type as string;
    if (dto.rate_amount !== undefined) worker.rate_amount = dto.rate_amount as number;
    if (dto.rate_currency !== undefined) worker.rate_currency = dto.rate_currency as string;
    if (dto.base_location_address !== undefined) worker.base_location_address = dto.base_location_address;
    if (dto.identity_document_type_enum !== undefined) worker.identity_document_type_enum = dto.identity_document_type_enum as any;
    if (dto.identity_document_number !== undefined) worker.identity_document_number = dto.identity_document_number as string;
    if (dto.cv_url !== undefined) worker.cv_url = dto.cv_url as string;

    await this.workerRepository.save(worker);
    return worker;
  }
}
