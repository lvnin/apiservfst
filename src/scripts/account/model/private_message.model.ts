/*
 * author: ninlyu.dev@outlook.com
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('private_messages')
export class PrivateMessageModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'recipient_id' })
  recipientId: number;

  @Column({ type: 'int', name: 'sender_id' })
  sender: any;

  @Column()
  content: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
  })
  updatedAt: Date;

  @Column({ type: 'tinyint', default: 0 })
  status: number;
}
