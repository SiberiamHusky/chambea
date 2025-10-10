import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserType } from '../../shared/enums';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { CreateWorkerProfileDto } from './dtos/create-worker-profile.dto';
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
}
