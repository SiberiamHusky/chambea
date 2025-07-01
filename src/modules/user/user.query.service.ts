import { BadRequestException, Injectable } from '@nestjs/common';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { AccountStatus, User, UserType } from './user.entity';
import { InternalServerErrorException } from '../../exceptions';
import { UserRepository } from './user.repository';

@Injectable()
export class UserQueryService {
  constructor(private readonly userRepository: UserRepository) {}

  // Busca un usuario por email usando el filtro de la entidad
  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.email = :email', { email })
        .getOne();

      return user;
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  // Busca un usuario por su identificador único (_id)
  async findById(id: string): Promise<User> {
    let user: User;
    try {
      user = await this.userRepository.findOne({ _id: id });
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
    return user;
  }

  // Crea un nuevo usuario en la base de datos
  async create(user: User): Promise<User> {
    let newUser: User;
    try {
      newUser = await this.userRepository.create(user);
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
    return newUser;
  }

  // Actualiza un usuario (versión simple)
  async update(id: string, updateData: Partial<User>): Promise<void> {
    try {
      await this.userRepository.update(id, updateData);
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  // O versión que retorna el usuario actualizado
  async updateAndReturn(id: string, updateData: Partial<User>): Promise<User> {
    try {
      const updatedUser = await this.userRepository.findByIdAndUpdate(id, updateData);
      if (!updatedUser) {
        throw new Error('User not found');
      }
      return updatedUser;
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async selectUserRole(userId: string, role: UserType): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }
    if (user.user_type) {
      throw new BadRequestException('El usuario ya tiene un rol asignado.');
    }
    if (user.account_status !== AccountStatus.PENDING_ROLE_SELECTION) {
      throw new BadRequestException('El usuario no está autorizado para seleccionar rol.');
    }

    await this.userRepository.update(userId, {
      user_type: role,
      account_status: role === UserType.WORKER ? AccountStatus.PENDING_VERIFICATION : AccountStatus.ACTIVE,
      updatedAt: new Date(),
    });

    return { message: `Rol seleccionado correctamente: ${role}` };
  }
}
