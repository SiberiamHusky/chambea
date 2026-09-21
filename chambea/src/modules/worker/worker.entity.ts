import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

export enum IdentityDocumentType {
  V = 'V',
  E = 'E',
  P = 'P',
  G = 'G',
}

@Entity('workers')
export class Worker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  bio: string;

  @Column('int')
  years_of_experience: number;

  @Column()
  availability_status: string;

  @Column()
  rate_type: string;

  @Column('decimal')
  rate_amount: number;

  @Column()
  rate_currency: string;

  @Column({ nullable: true })
  base_location_address?: string;

  @Column({
    type: 'enum',
    enum: IdentityDocumentType,
  })
  identity_document_type_enum: IdentityDocumentType;

  @Column()
  identity_document_number: string;

  @Column({ default: false })
  identity_verified_status: boolean;

  @Column({ nullable: true })
  cv_url?: string;
}
