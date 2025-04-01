/*
 * author: ninlyu.dev@outlook.com
 */
import { Injectable } from '@nestjs/common';
import { UserFollowModel } from '@scripts/account/model/user_follow.model';
import { QueryUserInfo } from '@scripts/account/constant/query/user.query';
import { UserModel, UserStatsEnum } from '@scripts/account/model/user.model';

@Injectable()
export class FollowService {
  // isFollowing - 是否关注
  // @param followerId number
  // @param userId number
  // @returns bool
  async isFollowing(followerId: number, userId: number) {
    if (followerId == 0) return false;

    return (
      (await UserFollowModel.count({
        where: {
          follower: followerId,
          user: userId,
        },
      })) > 0
    );
  }

  // enableFollow - 进行关注
  // @param followerId number
  // @param userId number
  // @returns
  async enableFollow(followerId: any, userId: any) {
    return UserFollowModel.insert({
      follower: followerId,
      user: userId,
    });
  }

  // disableFollow - 取消关注
  // @param followerId number
  // @param userId number
  // @returns
  async disableFollow(followerId: number, userId: number) {
    return await UserFollowModel.delete({
      follower: followerId,
      user: userId,
    });
  }

  // getFollowCount - 获取关注数
  // @param followerId number
  // @returns number
  async getFollowCount(followerId: number) {
    return UserFollowModel.createQueryBuilder('user_follow')
      .innerJoinAndMapOne(
        'user_follow.user',
        UserModel,
        'user',
        'user.id = user_follow.user AND user.status = :status',
        {
          status: UserStatsEnum.NORMAL,
        },
      )
      .select(
        ['user_follow.id', 'user_follow.createdAt'].concat(
          QueryUserInfo('user'),
        ),
      )
      .where({ follower: followerId })
      .getCount();
  }

  // getFollowList - 获取关注列表
  // @param followerId number
  // @param page number
  // @param pageSize number
  // @returns list object, total number
  async getFollowList(followerId: number, page: number, pageSize: number) {
    const [list, total] = await UserFollowModel.createQueryBuilder(
      'user_follow',
    )
      .innerJoinAndMapOne(
        'user_follow.user',
        UserModel,
        'user',
        'user.id = user_follow.user AND user.status = :status',
        {
          status: UserStatsEnum.NORMAL,
        },
      )
      .select(
        ['user_follow.id', 'user_follow.createdAt'].concat(
          QueryUserInfo('user'),
        ),
      )
      .where({ follower: followerId })
      .take(pageSize)
      .skip((page - 1) * pageSize)
      .getManyAndCount();

    return { list, total };
  }

  // getFansCount - 获取粉丝数
  // @param followerId number
  // @returns number
  async getFansCount(userId: number) {
    return UserFollowModel.createQueryBuilder('user_follow')
      .innerJoinAndMapOne(
        'user_follow.follower',
        UserModel,
        'user',
        'user.id = user_follow.follower AND user.status = :status',
        {
          status: UserStatsEnum.NORMAL,
        },
      )
      .select(
        ['user_follow.id', 'user_follow.createdAt'].concat(
          QueryUserInfo('user'),
        ),
      )
      .where({ user: userId })
      .getCount();
  }

  // getFansList - 获取粉丝列表
  // @param userId number
  // @param page number
  // @param pageSize number
  // @returns list object, total number
  async getFansList(userId: number, page: number, pageSize: number) {
    const [list, total] = await UserFollowModel.createQueryBuilder(
      'user_follow',
    )
      .innerJoinAndMapOne(
        'user_follow.follower',
        UserModel,
        'user',
        'user.id = user_follow.follower AND user.status = :status',
        {
          status: UserStatsEnum.NORMAL,
        },
      )
      .select(
        ['user_follow.id', 'user_follow.createdAt'].concat(
          QueryUserInfo('user'),
        ),
      )
      .where({ user: userId })
      .take(pageSize)
      .skip((page - 1) * pageSize)
      .getManyAndCount();

    return { list, total };
  }

  // getFansIdGroup - 获取粉丝id组
  // @param {number} userId
  async getFansIdGroup(userId: number) {
    return (
      await UserFollowModel.find({
        select: { follower: true },
        where: { user: userId },
      })
    ).map((v) => v.follower);
  }
}
