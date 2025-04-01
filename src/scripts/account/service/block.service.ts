/*
 * author: ninlyu.dev@outlook.com
 */
import { Injectable } from '@nestjs/common';
import { UserBlockModel } from '@scripts/account/model/user_block.model';
import { UserModel, UserStatsEnum } from '@scripts/account/model/user.model';
import { QueryUserInfo } from '@scripts/account/constant/query/user.query';

@Injectable()
export class BlockService {
  constructor() {}

  // getBlockList - 获取屏蔽列表
  // @param {any} where
  // @param {number} page
  // @param {number} pageSize
  // @returns any[], number
  async getBlockList(where: any, page: number, pageSize: number) {
    const [list, total] = await UserBlockModel.createQueryBuilder('user_block')
      .innerJoinAndMapOne(
        'user_block.user',
        UserModel,
        'user',
        'user.id = user_block.user AND user.status = :status',
        {
          status: UserStatsEnum.NORMAL,
        },
      )
      .select(
        ['user_block.id', 'user_block.createdAt'].concat(QueryUserInfo('user')),
      )
      .where(where)
      .take(pageSize)
      .skip((page - 1) * pageSize)
      .getManyAndCount();

    return { list, total };
  }

  // checkBlocked - 判断是否被屏蔽
  // @param {number} blockerId
  // @param {number} userId
  // @param {string} blockType
  // @returns boolean
  async checkBlocked(blockerId: number, userId: number, blockType: string) {
    return UserBlockModel.exists({
      where: { blocker: blockerId, user: userId, type: blockType },
    });
  }

  // addBlock - 加入屏蔽
  // @param {any} blockerId
  // @param {any} userId
  // @param {string} blockType
  // @returns boolean
  async addBlock(blockerId: any, userId: any, blockType: string) {
    return (
      (
        await UserBlockModel.insert({
          blocker: blockerId,
          user: userId,
          type: blockType,
        })
      ).raw.insertId > 0
    );
  }

  // delBlock - 删除屏蔽
  // @param {number} blockerId
  // @param {number} userId
  // @param {string} blockType
  // @returns boolean
  async delBlock(blockerId: number, userId: number, blockType: string) {
    return (
      (
        await UserBlockModel.delete({
          blocker: blockerId,
          user: userId,
          type: blockType,
        })
      ).affected > 0
    );
  }
}
