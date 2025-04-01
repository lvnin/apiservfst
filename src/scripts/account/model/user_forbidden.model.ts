/*
 * author: ninlyu.dev@outlook.com
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export const AppealStatsEnum = {
  DISABLED: 0, // 不可申诉
  ENABLED: 1, // 可申诉
};

@Entity('user_forbidden')
export class UserForbiddenModel extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: '封禁ID' })
  id: number;

  @Column({ type: 'int', name: 'user_id', comment: '用户ID' })
  userId: number;

  @Column({ type: 'text', comment: '封禁原由' })
  desc: string;

  @Column({ type: 'text', comment: '处理结果', default: null })
  explain: string;

  @Column({
    name: 'duration',
    default: 0,
    comment: '封禁时长（毫秒）',
  })
  duration: number;

  @Column({
    type: 'tinyint',
    name: 'appeal_times',
    default: 3,
    comment: '申诉次数',
  })
  appealTimes: number;

  @Column({
    type: 'text',
    name: 'appeal_content',
    comment: '申诉内容',
    default: null,
  })
  appealContent: string;

  @Column({
    name: 'appeal_at',
    type: 'datetime',
    comment: '申诉时间',
    default: null,
  })
  appealAt: Date;

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

  @Column({
    type: 'tinyint',
    default: AppealStatsEnum.ENABLED,
  })
  status: number;
}
