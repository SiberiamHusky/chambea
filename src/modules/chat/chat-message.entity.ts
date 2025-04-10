import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { User } from '../user/user.entity';

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  senderId: string;

  @Column()
  receiverId: string;

  @ManyToOne(() => User, (user) => user.sentMessages, { eager: true })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages, { eager: true })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
