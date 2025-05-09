import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

// eslint-disable-next-line import/no-cycle
import { ChatMessage } from '../chat/chat-message.entity';
import { DatabaseCollectionNames } from '../../shared/enums';

export enum UserType {
  WORKER = 'worker',
  EMPLOYER = 'employer',
  PENDING = 'pending',
}

export enum AccountStatus {
  PENDING_VERIFICATION = 'pending_verification',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

@Index(['email'])
@Entity({ name: DatabaseCollectionNames.USER })
export class User {
  @ApiProperty({
    description: 'El identificador único del usuario',
    example: 'uuid-generado-automáticamente',
  })
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @ApiProperty({
    description: 'El email único del usuario',
    example: 'john@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Column({ nullable: true, select: false })
  password?: string;

  @ApiProperty({
    description: 'El tipo de usuario',
    example: 'worker',
  })
  @Column({ default: UserType.PENDING })
  user_type: UserType;

  @ApiProperty({
    description: 'El nombre del usuario',
    example: 'Joc',
  })
  @Column()
  first_name?: string;

  @ApiProperty({
    description: 'El apellido del usuario',
    example: 'Ferreira',
  })
  @Column({ nullable: true })
  last_name?: string;

  @ApiProperty({
    description: 'El número de teléfono del usuario',
    example: '04243460227',
  })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({
    description: 'Url de la foto de perfil del usuario',
    example: 'Ferreira',
  })
  @Column({ nullable: true })
  profile_picture_url?: string;

  @ApiProperty({
    description: 'Indica el status de la cuenta del usuario',
    example: true,
  })
  @Column({ default: AccountStatus.PENDING_VERIFICATION })
  account_status: AccountStatus;

  @ApiHideProperty()
  @Column({ nullable: true })
  verificationCode?: number;

  @ApiHideProperty()
  @Column({ type: 'timestamp', nullable: true })
  verificationCodeExpiry?: Date;

  @ApiProperty({
    description: 'Indica si el usuario ha verificado su dirección de correo',
    example: true,
  })
  @Column({ default: false })
  email_verified: boolean;

  @ApiProperty({
    description: 'Indica si el usuario ha verificado su numero de telefono',
    example: true,
  })
  @Column({ default: false })
  phone_verified: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Fecha del último inicio de sesión',
    example: '2025-04-14T12:34:56.789Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  last_login_date?: Date;

  @OneToMany(() => ChatMessage, (message) => message.sender)
  sentMessages: ChatMessage[];

  @OneToMany(() => ChatMessage, (message) => message.receiver)
  receivedMessages: ChatMessage[];
}
