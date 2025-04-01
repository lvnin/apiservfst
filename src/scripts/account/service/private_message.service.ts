/*
 * author: ninlyu.dev@outlook.com
 */
import { QueryUserInfo } from '@scripts/account/constant/query/user.query';
import { QueryPrivMsgInfo } from '@scripts/account/constant/query/private_message.query';
import { PrivateMessageModel } from '@scripts/account/model/private_message.model';
import { UserModel, UserStatsEnum } from '@scripts/account/model/user.model';
import { Injectable } from '@nestjs/common';
import { ReadStatsEnum } from '@constant/enum';

@Injectable()
export class PrivateMessageService {
  // createPrivateMessage - 创建私信
  // @param recipientId number
  // @param senderId number
  // @param content string
  async createPrivateMessage({ recipientId, senderId, content }) {
    return PrivateMessageModel.insert({
      recipientId,
      sender: senderId,
      content,
    });
  }

  // getPrivateMessageList - 获取私信列表
  // @param recipientId number
  // @param page number
  // @param pageSize number
  // @returns list any total number
  async getPrivateMessageList(
    recipientId: number,
    page: number,
    pageSize: number,
  ) {
    const [list, total] = await PrivateMessageModel.createQueryBuilder(
      'private_message',
    )
      .innerJoinAndMapOne(
        'private_message.sender',
        UserModel,
        'user',
        'user.id = private_message.sender AND user.forbidden = 0',
      )
      .select(QueryPrivMsgInfo('private_message').concat(QueryUserInfo('user')))
      .where({ recipientId })
      .take(pageSize)
      .skip((page - 1) * pageSize)
      .getManyAndCount();

    PrivateMessageModel.update(
      {
        recipientId,
      },
      { status: ReadStatsEnum.READED },
    );

    return { list, total };
  }

  // delPrivateMessage - 删除私信
  // @param privMsgId number
  // @returns
  async delPrivateMessage(privMsgId: number) {
    return PrivateMessageModel.delete({ id: privMsgId });
  }

  // clearPrivateMessage - 清空私信
  // @param recipientId number
  // @returns
  async clearPrivateMessage(recipientId: number) {
    return PrivateMessageModel.delete({ recipientId });
  }

  // setPrivateMessage - 更新私信
  // @param where object
  // @param sets object
  // @returns
  async setPrivateMessage(where: object, sets: object) {
    return PrivateMessageModel.update(where, sets);
  }

  // getNotifyCountByStatus - 根据状态获取私信数
  // @param userId number
  // @param status number
  // @returns
  async getPrivateMessageCountByStatus(userId: number, status: number) {
    return PrivateMessageModel.countBy({
      recipientId: userId,
      status,
    });
  }
}
