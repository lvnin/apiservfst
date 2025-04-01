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

export const UserGenderEnum = {
  UNDISCLOSED: -1, // 保密
  FEMALE: 0, // 女性
  MALE: 1, // 男性
};

export const UserStatsEnum = {
  DESTROYED: 0, // 注销
  NORMAL: 1, // 正常
};

@Entity('users')
export class UserModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: any;

  @Column({
    type: 'boolean',
    name: 'is_auth',
    default: false,
  })
  isAuth: boolean;

  @Column()
  mobile: string;

  @Column({ name: 'idcard_no', default: null })
  idCardNo: string;

  @Column({ name: 'real_name', default: null })
  realName: string;

  @Column({ default: null })
  username: string;

  @Column({ default: null })
  password: string;

  @Column()
  nickname: string;

  @Column({ default: 'avatarDefault' })
  avatar: string;

  @Column({ default: UserGenderEnum.UNDISCLOSED })
  gender: number;

  @Column({ default: null })
  bio: string;

  @Column({ default: 'bgDefault' })
  bgpic: string;

  @Column({ default: null })
  location: string;

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

  @Column({ type: 'int', name: 'forbidden_id', default: 0, comment: '封禁ID' })
  forbidden: number;

  @Column({ type: 'tinyint', default: UserStatsEnum.NORMAL })
  status: number;
}
