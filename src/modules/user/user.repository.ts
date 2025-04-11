import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async find(filter: FindOptionsWhere<User>): Promise<User[]> {
    return this.repository.find({ where: filter });
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { _id: id } as FindOptionsWhere<User> });
  }

  async findOne(filter: FindOptionsWhere<User>): Promise<User | null> {
    return this.repository.findOne({ where: filter });
  }

  async create(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findOneAndUpdate(filter: FindOptionsWhere<User>, update: Partial<User>): Promise<User | null> {
    const user = await this.repository.findOne({ where: filter });
    if (!user) {
      return null;
    }
    Object.assign(user, update);
    return this.repository.save(user);
  }

  async findByIdAndUpdate(id: string, update: Partial<User>): Promise<User | null> {
    const user = await this.repository.findOne({ where: { _id: id } as FindOptionsWhere<User> });
    if (!user) {
      return null;
    }
    Object.assign(user, update);
    return this.repository.save(user);
  }

  // Funcion agregado para exponer el createQueryBuilder
  public createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }

  // Agrega este nuevo método para actualización directa
  async update(id: string, updateData: Partial<User>): Promise<void> {
    await this.repository.update(id, updateData);
  }
}
