/*
 * author: ninlyu.dev@outlook.com
 */
import { UserModel, UserStatsEnum } from '@scripts/account/model/user.model';
import { Injectable } from '@nestjs/common';
import { UserBlacklistModel } from '@scripts/account/model/user_blacklist.model';
import { QueryUserInfo } from '@scripts/account/constant/query/user.query';

@Injectable()
export class BlacklistService {
  constructor() {}

  // getBlackList - 获取黑名单列表
  // @param {number} userId
  // @param {number} page
  // @param {number} pageSize
  // @returns any[], number
  async getBlackList(userId: number, page: number, pageSize: number) {
    const [list, total] = await UserBlacklistModel.createQueryBuilder(
      'user_blacklist',
    )
      .innerJoinAndMapOne(
        'user_blacklist.member',
        UserModel,
        'user',
        'user.id = user_blacklist.member AND user.status = :status',
        {
          status: UserStatsEnum.NORMAL,
        },
      )
      .select(
        ['user_blacklist.id', 'user_blacklist.createdAt'].concat(
          QueryUserInfo('user'),
        ),
      )
      .where({ user: userId })
      .take(pageSize)
      .skip((page - 1) * pageSize)
      .getManyAndCount();

    return { list, total };
  }

  // addBlackList - 加入黑名单
  // @param {any} userId
  // @param {any} memberId
  // @returns boolean
  async addBlackList(userId: any, memberId: any) {
    return (
      (
        await UserBlacklistModel.insert({
          user: userId,
          member: memberId,
        })
      ).raw.insertId > 0
    );
  }

  // delBlackList - 删除黑名单
  // @param {any} userId
  // @param {any} memberId
  // @returns boolean
  async delBlackList(userId: number, memberId: number) {
    return (
      (
        await UserBlacklistModel.delete({
          user: userId,
          member: memberId,
        })
      ).affected > 0
    );
  }

  // checkBlackListed - 是否已拉黑
  // @param {any} userId
  // @param {any} memberId
  // @returns boolean
  async checkBlackListed(userId: number, memberId: number) {
    return UserBlacklistModel.exists({
      where: { user: userId, member: memberId },
    });
  }

  // isBlackListed - 是否拉黑
  // @param {any} userId
  // @param {any} memberId
  // @returns boolean
  async isBlackListed(userId: number, memberId: number) {
    return (
      (await this.checkBlackListed(userId, memberId)) ||
      (await this.checkBlackListed(memberId, userId))
    );
  }
}
