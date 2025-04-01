/*
 * author: ninlyu.dev@outlook.com
 */
import { Injectable } from '@nestjs/common';
import { UserModel } from '@scripts/account/model/user.model';
import datetime from '@utils/datetime';
import validator from '@utils/validator';
import {
  AppealStatsEnum,
  UserForbiddenModel,
} from '@scripts/account/model/user_forbidden.model';
import { QueryForbiddenInfo } from '@scripts/account/constant/query/forbidden.query';

@Injectable()
export class ForbiddenService {
  constructor() {}

  // getForbiddenData - 获取封禁数据
  // @param {number} forbiddenId
  // @returns any
  async getForbiddenData(forbiddenId: number) {
    return UserForbiddenModel.findOne({
      select: QueryForbiddenInfo(),
      where: { id: forbiddenId },
    });
  }

  // setForbiddenData - 更新封禁数据
  // @param {any} where
  // @param {any} sets
  // @returns boolean
  async setForbiddenData(where: any, sets: any) {
    return (await UserForbiddenModel.update(where, sets)).affected > 0;
  }

  // delForbiddenData - 删除封禁数据
  // @param {number} forbiddenId
  // @returns boolean
  async delForbiddenData(forbiddenId: number) {
    return (
      (
        await UserForbiddenModel.delete({
          id: forbiddenId,
        })
      ).affected > 0
    );
  }

  // isForbidden - 是否在封禁
  // @param {number} userId
  // @param {number} forbiddenId
  // @returns boolean
  async isForbidden(userId: number, forbiddenId: number) {
    if (forbiddenId == 0) return false;

    var forbiddenData = await this.getForbiddenData(forbiddenId);
    if (validator.isNULL(forbiddenData)) {
      return false;
    }

    if (forbiddenData.duration == 0) {
      // 永久封禁
      return true;
    }

    if (
      datetime.now() - forbiddenData.createdAt.getTime() <
      forbiddenData.duration
    ) {
      // 还在封禁期间
      return true;
    }

    if (await this.delForbiddenData(forbiddenId)) {
      await UserModel.update(
        { id: userId },
        {
          forbidden: 0,
        },
      );
    }

    return false;
  }

  // getAppealCount - 获取申诉次数
  // @param {number} forbiddenId
  // @returns number
  async getAppealCount(forbiddenId: number) {
    return (
      (
        await UserForbiddenModel.findOne({
          select: { appealTimes: true },
          where: { id: forbiddenId },
        })
      )?.appealTimes ?? 3
    );
  }

  // checkAppeal - 判断是否可申诉
  // @param {number} forbiddenId
  // @returns boolean
  async checkAppeal(forbiddenId: number) {
    return (
      (
        await UserForbiddenModel.findOne({
          select: { status: true },
          where: { id: forbiddenId },
        })
      ).status == AppealStatsEnum.ENABLED
    );
  }
}
