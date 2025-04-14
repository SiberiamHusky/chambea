import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

// eslint-disable-next-line import/no-cycle
import { ChatMessage } from '../chat/chat-message.entity';
import { DatabaseCollectionNames } from '../../shared/enums';

@Index(['email', 'isActive'])
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
    description: 'El nombre completo del usuario',
    example: 'John Doe',
  })
  @Column({ nullable: true })
  name?: string;

  @ApiProperty({
    description: 'Indica si el usuario ha verificado su dirección de correo',
    example: true,
  })
  @Column({ default: false })
  verified: boolean;

  @ApiHideProperty()
  @Column({ nullable: true })
  verificationCode?: number;

  @ApiHideProperty()
  @Column({ type: 'timestamp', nullable: true })
  verificationCodeExpiry?: Date;

  @ApiHideProperty()
  @Column({ nullable: true })
  resetToken?: string;

  @ApiHideProperty()
  @Column({ nullable: true })
  registerCode?: number;

  @ApiProperty({
    description: 'Indica si el usuario está activo',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

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

  @OneToMany(() => ChatMessage, (message) => message.sender)
  sentMessages: ChatMessage[];

  @OneToMany(() => ChatMessage, (message) => message.receiver)
  receivedMessages: ChatMessage[];
}
