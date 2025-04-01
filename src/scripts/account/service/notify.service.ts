/*
 * author: ninlyu.dev@outlook.com
 */
import { ReadStatsEnum } from '@constant/enum';
import { NotifyModel } from '@scripts/account/model/notify.model';
import { pushSdk } from '@sdk/push';
import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { NotifyReadModel } from '@scripts/account/model/notify_read.model';

@Injectable()
export class NotifyService {
  // sendNotify - 发送通知
  // @param {string} [title]
  // @param {string} [content]
  // @param {number[]} recipientIds
  async sendNotify({ title, content }, recipientIds = []) {
    for (const recipientId of recipientIds) {
      if (recipientId > 0) {
        await NotifyModel.insert({
          userId: recipientId,
          title,
          content,
        });

        pushSdk.notify(recipientId, { title, content });
      }
    }
  }

  // getNotifyList - 获取通知列表
  // @param recipientId number
  // @param page number
  // @param pageSize number
  // @returns list any total number
  async getNotifyList(recipientId: number, page: number, pageSize: number) {
    const [list, total] = await NotifyModel.findAndCount({
      where: {
        userId: recipientId,
      },
      order: {
        id: 'DESC',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  // delNotify - 删除通知
  // @param notifyId number
  // @returns
  async delNotify(notifyId: number) {
    return await NotifyModel.delete({ id: notifyId });
  }

  // clearNotify - 清空通知
  // @param userId number
  // @returns
  async clearNotify(recipientId: number) {
    return await NotifyModel.delete({ userId: recipientId });
  }

  // setNotify - 更新通知
  // @param where object
  // @param sets object
  // @returns
  async setNotify(where: object, sets: object) {
    return await NotifyModel.update(where, sets);
  }

  /**
   * doNotifyRead - 已读通知
   * @param recipientId
   * @param userId
   * @param idGroup
   * @returns
   */
  async doNotifyRead(recipientId: number, userId: number, idGroup: number[]) {
    if (recipientId == 0) {
      const readNotifyGroup = (
        await NotifyReadModel.find({
          select: { notifyId: true },
          where: { userId },
        })
      ).map((e) => e.notifyId);

      // 官方通知
      const unreadLis = [];
      for (let i = 0; i < idGroup.length; i++) {
        if (!readNotifyGroup.includes(idGroup[i])) {
          unreadLis.push({
            userId,
            notifyId: idGroup[i],
          });
        }
      }
      await NotifyReadModel.insert(unreadLis);
    } else {
      await NotifyModel.update(
        { userId: recipientId, id: In(idGroup) },
        {
          status: ReadStatsEnum.READED,
        },
      );
    }
  }

  /**
   * getNotifyUnreadCount - 获取通知未读数
   * @param recipientId
   * @param userId
   * @returns
   */
  async getNotifyUnreadCount(recipientId: number, userId: number) {
    if (recipientId == 0) {
      // 官方通知
      return NotifyModel.createQueryBuilder('notify')
        .leftJoinAndMapOne(
          'notify.id',
          NotifyReadModel,
          'notify_read',
          'notify_read.notifyId = notify.id AND notify_read.userId = :userId',
          {
            userId,
          },
        )
        .where({
          userId: recipientId,
        })
        .andWhere('notify_read.userId IS NULL')
        .getCount();
    } else {
      return await NotifyModel.count({
        where: { userId: recipientId, status: ReadStatsEnum.UNREAD },
      });
    }
  }

  /**
   * getNotifyInfoData - 获取通知信息数据
   * @param recipientId
   * @param userId
   * @returns
   */
  async getNotifyInfoData(recipientId: number, userId: number) {
    const latestData = await NotifyModel.findOne({
      select: { title: true, createdAt: true },
      where: { userId: recipientId },
      order: {
        id: 'DESC',
      },
    });

    return {
      unreadTotal: await this.getNotifyUnreadCount(recipientId, userId),
      latestTitle: latestData?.title,
      latestAt: latestData?.createdAt,
    };
  }

  /**
   * checkNotifyBehavior - 判断是否有通知动态
   * @param recipientId
   * @returns
   */
  async checkNotifyBehavior(recipientId: number) {
    return (
      (await this.getNotifyUnreadCount(0, recipientId)) > 0 ||
      (await this.getNotifyUnreadCount(recipientId, recipientId)) > 0
    );
  }
}
