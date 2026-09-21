import { BadRequestException, Injectable } from '@nestjs/common';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { AccountStatus, UserType } from '../../shared/enums';
import { InternalServerErrorException } from '../../exceptions';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Worker } from '../worker/worker.entity';
import { Employer } from '../employer/employer.entity';
import { JobPosting } from '../jobs/job-posting.entity';
import { JobApplication } from '../applications/job-application.entity';
import { ChatMessage } from '../chat/chat-message.entity';

@Injectable()
export class UserQueryService {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Worker) private readonly workerRepo: Repository<Worker>,
    @InjectRepository(Employer) private readonly employerRepo: Repository<Employer>,
    @InjectRepository(JobPosting) private readonly jobRepo: Repository<JobPosting>,
    @InjectRepository(JobApplication) private readonly jobAppRepo: Repository<JobApplication>,
    @InjectRepository(ChatMessage) private readonly chatRepo: Repository<ChatMessage>,
  ) {}

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
    if (user.user_type !== UserType.PENDING) {
      throw new BadRequestException('El usuario ya tiene un rol asignado.');
    }
    if (user.account_status !== AccountStatus.PENDING_ROLE_SELECTION) {
      throw new BadRequestException('El usuario no está autorizado para seleccionar rol.');
    }
    if (role === UserType.ADMIN) {
      throw new BadRequestException('El rol admin no puede seleccionarse desde este flujo.');
    }

    await this.userRepository.update(userId, {
      user_type: role,
      account_status: AccountStatus.ACTIVE,
      updatedAt: new Date(),
    });

    return { message: `Rol seleccionado correctamente: ${role}` };
  }

  // Desactiva y anonimiza la cuenta del usuario (borrado lógico)
  async deactivateAccount(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }

    const anonymizedEmail = `deleted_${user._id}@example.invalid`;

    const updateData: Partial<User> = {
      account_status: AccountStatus.INACTIVE,
      user_type: UserType.PENDING,
      email: anonymizedEmail,
      first_name: '',
      last_name: '',
      phone: null,
      profile_picture_url: null,
      password: null,
      email_verified: false,
      phone_verified: false,
      verificationCode: null,
      verificationCodeExpiry: null,
      last_login_date: null,
      updatedAt: new Date(),
    } as Partial<User>;

    try {
      await this.userRepository.update(userId, updateData);
      return { message: 'Cuenta desactivada correctamente' };
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  // Borrado físico de la cuenta del usuario y sus dependencias
  async deleteAccountHard(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Eliminar mensajes de chat (enviados y recibidos)
      await queryRunner.manager.getRepository(ChatMessage).delete({ senderId: userId });
      await queryRunner.manager.getRepository(ChatMessage).delete({ receiverId: userId });

      // Eliminar entidad Worker y sus aplicaciones
      const worker = await queryRunner.manager
        .getRepository(Worker)
        .createQueryBuilder('w')
        .where('w.user_id = :userId', { userId })
        .getOne();

      if (worker) {
        await queryRunner.manager.getRepository(JobApplication).delete({ worker_id: worker.id });
        await queryRunner.manager.getRepository(Worker).delete({ id: worker.id });
      }

      // Eliminar entidad Employer, sus ofertas y las aplicaciones de esas ofertas
      const employer = await queryRunner.manager.getRepository(Employer).findOne({ where: { user_id: userId } });

      if (employer) {
        const jobs = await queryRunner.manager
          .getRepository(JobPosting)
          .find({ where: { employer_id: employer.employer_id } });
        const jobIds = jobs.map((j) => j.job_id);

        if (jobIds.length > 0) {
          await queryRunner.manager
            .getRepository(JobApplication)
            .createQueryBuilder()
            .delete()
            .where('job_id IN (:...jobIds)', { jobIds })
            .execute();

          await queryRunner.manager
            .getRepository(JobPosting)
            .createQueryBuilder()
            .delete()
            .where('job_id IN (:...jobIds)', { jobIds })
            .execute();
        }

        await queryRunner.manager.getRepository(Employer).delete({ employer_id: employer.employer_id });
      }

      // Finalmente eliminar el usuario
      await queryRunner.manager.getRepository(User).delete({ _id: userId });

      await queryRunner.commitTransaction();
      return { message: 'Cuenta eliminada permanentemente' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    } finally {
      await queryRunner.release();
    }
  }
}
