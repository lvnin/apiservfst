/*
 * author: ninlyu.dev@outlook.com
 */
import { errcode } from '@constant/errcode';
import { JwtAuthGuard } from '@guard/jwt.guard';
import { PrivateMessageService } from '@scripts/account/service/private_message.service';
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

@Controller('v1/private_message')
@UseGuards(JwtAuthGuard)
export class PrivateMessageController {
  constructor(private readonly privateMessageService: PrivateMessageService) {}

  /**
   * @api {get} /private_message/list
   * @apiName PrivateMessageList 私信列表
   * @apiGroup PrivateMessage
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
  async PrivateMessageList(@Request() req: any, @Query() query: any) {
    const { page, pageSize } = query;
    return ResponseWrapper.ok(
      await this.privateMessageService.getPrivateMessageList(
        req.claims.user.id,
        page,
        pageSize,
      ),
    );
  }

  /**
   * @api {post} /private_message/del
   * @apiName PrivateMessageDel 私信删除
   * @apiGroup PrivateMessage
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiBody {number} msgId
   *
   */
  @Post('del')
  async PrivateMessageDel(@Body() body: any) {
    const { privMsgId } = body;
    if (!(await this.privateMessageService.delPrivateMessage(privMsgId))) {
      return ResponseWrapper.fail(errcode('ERR_DELETE_FAILURE'));
    }

    return ResponseWrapper.ok(null, errcode('ERR_DELETE_SUCCESS'));
  }

  /**
   * @api {post} /private_message/send
   * @apiName PrivateMessageSend 私信发送
   * @apiGroup PrivateMessage
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiBody {number} recipientId
   * @apiBody {string} content
   *
   */
  @Post('send')
  async PrivateMessageSend(@Request() req: any, @Body() body: any) {
    const { recipientId, content } = body;
    if (
      !(await this.privateMessageService.createPrivateMessage({
        recipientId,
        senderId: req.claims.user.id,
        content,
      }))
    ) {
      return ResponseWrapper.fail(errcode('ERR_SENT_FAILURE'));
    }

    return ResponseWrapper.ok(null, errcode('ERR_SENT_SUCCESS'));
  }
}
