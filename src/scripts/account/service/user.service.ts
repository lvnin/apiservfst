/*
 * author: ninlyu.dev@outlook.com
 */
import { QueryUserInfo } from '@scripts/account/constant/query/user.query';
import { UserModel, UserStatsEnum } from '@scripts/account/model/user.model';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Like } from 'typeorm';
import Validator from '@utils/validator';
import { errcode } from '@constant/errcode';
import { objectMerge } from '@utils/function';
import { FollowService } from '@scripts/account/service/follow.service';
import { ForbiddenService } from '@scripts/account/service/forbidden.service';
import { UserForbiddenModel } from '@scripts/account/model/user_forbidden.model';
import { QueryForbiddenInfo } from '@scripts/account/constant/query/forbidden.query';
import { PrivateMessageModel } from '@scripts/account/model/private_message.model';
import { ReadStatsEnum } from '@constant/enum';
import validator from '@utils/validator';
import { NotifyService } from '@scripts/account/service/notify.service';

@Injectable()
export class UserService {
  constructor(
    private readonly followService: FollowService,
    private readonly forbiddenService: ForbiddenService,
    private readonly notifyService: NotifyService,
  ) {}

  // createUser - 创建用户数据
  // @param data object
  async createUser(data: object) {
    return UserModel.insert(data);
  }

  // getUserList - 获取用户列表
  // @param kw string
  // @param page number
  // @param pageSize number
  // @returns list object, total number
  async getUserList(page: number, pageSize: number, extra: any = {}) {
    objectMerge(extra, {
      kw: '',
      selfUserId: 0,
    });

    const [list, total] = await UserModel.findAndCount({
      where: [
        { id: Like(`%${extra.kw}%`), status: UserStatsEnum.NORMAL },
        { username: Like(`%${extra.kw}%`), status: UserStatsEnum.NORMAL },
        { nickname: Like(`%${extra.kw}%`), status: UserStatsEnum.NORMAL },
      ],
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    for (let i = 0; i < list.length; i++) {
      objectMerge(list[i], {
        isOwn: list[i].id == extra.selfUserId,
        isFollowing: await this.followService.isFollowing(
          extra.selfUserId,
          list[i].id,
        ),
      });
    }

    return { list, total };
  }

  // setUser - 更新用户数据
  // @param where object
  // @param data object
  // @returns
  async setUser(where: object, data: object) {
    return (await UserModel.update(where, data)).affected > 0;
  }

  /**
   * getUser - 获取用户
   * @param where
   * @param query
   * @param extra
   * @returns
   */
  async getUser(where: object, query: any = QueryUserInfo(), extra: any = {}) {
    objectMerge(extra, {
      withForbidden: false,
      selfUserId: 0,
      followerId: 0,
      subscriberId: 0,
    });

    let userData = null;

    if (extra.withForbidden) {
      userData = UserModel.createQueryBuilder('user')
        .leftJoinAndMapOne(
          'user.forbidden',
          UserForbiddenModel,
          'forbidden',
          'forbidden.id = user.forbidden',
        )
        .select(query.concat(QueryForbiddenInfo('forbidden')))
        .where(where)
        .getOne();
    } else {
      userData = await UserModel.findOne({ select: query, where });
    }

    if (validator.isNULL(userData)) return null;

    userData = {
      ...userData,
      ...{
        isOwn: userData.id == extra.selfUserId,
      },
    };

    if (extra.followerId > 0) {
      userData = {
        ...userData,
        ...{
          isFollowing: await this.followService.isFollowing(
            extra.followerId,
            userData.id,
          ),
        },
      };
    }

    if (extra.subscriberId > 0) {
      userData = {
        ...userData,
      };
    }

    return userData;
  }

  /**
   * getUserTotalData - 获取用户计数数据
   * @param userId
   * @param extra
   * @returns
   */
  async getUserTotalData(userId: number, extra: any = {}) {
    objectMerge(extra, {
      selfUserId: 0,
    });
    return {
      // 关注数
      followTotal: await this.followService.getFollowCount(userId),
      // 粉丝数
      fansTotal: await this.followService.getFansCount(userId),
    };
  }

  /**
   * getUserBehaviorData - 获取用户红点数据
   * @param userId
   * @returns
   */
  async getUserBehaviorData(userId: number) {
    return {
      // 通知红点
      hasNotifyBehavior: await this.notifyService.checkNotifyBehavior(userId),
      // 私信红点
      hasPrivMsgBehavior:
        (await PrivateMessageModel.count({
          where: {
            recipientId: userId,
            status: ReadStatsEnum.UNREAD,
          },
        })) > 0,
      // 推送红点
      hasMsgFeedBehavior: false,
      // 订阅红点
      hasMsgSubscribeBehavior: false,
    };
  }

  // checkUser - 验证用户
  // @param where object
  // @returns bool
  async checkUser(where: object) {
    return UserModel.exists({ where });
  }

  // doDetectingAccount - 检测账号
  // @param {number} userId
  // @returns
  async doDetectingAccount(userId: number) {
    const userData = await UserModel.findOne({
      select: { status: true, forbidden: true },
      where: { id: userId, status: UserStatsEnum.NORMAL },
    });

    if (Validator.isNULL(userData)) {
      return errcode('ERR_ACCOUNT_NONEXIST');
    } else if (
      await this.forbiddenService.isForbidden(userData.id, userData.forbidden)
    ) {
      return errcode('ERR_ACCOUNT_FORBIDDEN');
    } /* else if (userData.status == UserStatsEnum.UNVALIDATED) {
      return errcode('ERR_ACCOUNT_WAS_DESTROYED');
    }*/

    return errcode('ERR_VALID_SUCCESS');
  }
}
