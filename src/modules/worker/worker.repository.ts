import { FindOptionsWhere, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Worker } from './worker.entity';

@Injectable()
export class WorkerRepository {
  constructor(private readonly repository: Repository<Worker>) {}

  async create(worker: Worker): Promise<Worker> {
    return this.repository.save(worker);
  }

  async findById(id: string): Promise<Worker | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findOne(filter: FindOptionsWhere<Worker>): Promise<Worker | null> {
    return this.repository.findOne({ where: filter });
  }

  async find(filter: FindOptionsWhere<Worker>): Promise<Worker[]> {
    return this.repository.find({ where: filter });
  }

  async update(id: string, updateData: Partial<Worker>): Promise<void> {
    await this.repository.update(id, updateData);
  }

  public createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }
}
