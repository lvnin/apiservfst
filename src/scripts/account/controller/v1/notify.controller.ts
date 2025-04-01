/*
 * author: ninlyu.dev@outlook.com
 */
import { ReadStatsEnum } from '@constant/enum';
import { errcode } from '@constant/errcode';
import { JwtAuthGuard } from '@guard/jwt.guard';
import { NotifyService } from '@scripts/account/service/notify.service';
import { ResponseWrapper } from '@utils/wrappers';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

@Controller('v1/notify')
@UseGuards(JwtAuthGuard)
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  /**
   * @api {get} /notify/list
   * @apiName NotifyList 通知列表
   * @apiGroup Notify
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiQuery {number} userId
   * @apiQuery {number} page
   * @apiQuery {number} pageSize
   *
   * @apiSuccess {any[]} list
   * @apiSuccess {number} total
   */
  @Get('list')
  async NotifyList(@Request() req: any, @Query() query: any) {
    const { userId, page, pageSize } = query;
    const data = await this.notifyService.getNotifyList(userId, page, pageSize);
    const unreadIdGroup = data.list
      .filter((v) => v.status == ReadStatsEnum.UNREAD)
      .map((v) => v.id);

    if (unreadIdGroup.length > 0) {
      // 将获取的列表同追自动设置为已读
      this.notifyService.doNotifyRead(
        userId,
        req.claims.user.id,
        unreadIdGroup,
      );
    }

    return ResponseWrapper.ok(data);
  }

  /**
   * @api {post} /notify/del
   * @apiName NotifyDel 通知删除
   * @apiGroup Notify
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiBody {number} notifyId
   *
   */
  @Post('del')
  async NotifyDel(@Request() req: any, @Body() body: any) {
    const { notifyId } = body;
    if (notifyId == 0) {
      // 清空通知
      if (!(await this.notifyService.clearNotify(req.claims.user.id))) {
        return ResponseWrapper.fail(errcode('ERR_CLEAN_FAILURE'));
      }
    } else {
      // 删除指定通知
      if (!(await this.notifyService.delNotify(notifyId))) {
        return ResponseWrapper.fail(errcode('ERR_DELETE_FAILURE'));
      }
    }

    return ResponseWrapper.ok(null, errcode('ERR_DELETE_SUCCESS'));
  }

  /**
   * @api {get} /notify/center/info
   * @apiName NotifyInfo 通知信息
   * @apiGroup Notify
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   */
  @Get('center/info')
  async NotifyCenterInfo(@Request() req: any) {
    return ResponseWrapper.ok({
      privMsgInfo: { unreadTotal: 0 },
    });
  }
}
