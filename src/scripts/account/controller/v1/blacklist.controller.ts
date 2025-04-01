/*
 * author: ninlyu.dev@outlook.com
 */
import {
  Controller,
  Post,
  Body,
  Request,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResponseWrapper } from '@utils/wrappers';
import { errcode } from '@constant/errcode';
import { JwtAuthGuard } from '@guard/jwt.guard';
import { BlacklistService } from '@scripts/account/service/blacklist.service';
import { FollowService } from '@scripts/account/service/follow.service';

@Controller('v1/blacklist')
export class BlacklistController {
  constructor(
    private readonly blacklistService: BlacklistService,
    private readonly followService: FollowService,
  ) {}

  /**
   * @api {get} /blacklist/list
   * @apiName BlacklistList 黑名单列表
   * @apiGroup Blacklist
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiQuery {number} page
   * @apiQuery {number} pageSize
   *
   * @apiSuccess {any[]} list
   * @apiSuccess {number} total
   */
  @Get('list')
  @UseGuards(JwtAuthGuard)
  async BlacklistList(@Request() req: any, @Query() query: any) {
    const { page, pageSize } = query;
    return ResponseWrapper.ok(
      await this.blacklistService.getBlackList(
        req.claims.user.id,
        page,
        pageSize,
      ),
    );
  }

  /**
   * @api {post} /blacklist/do
   * @apiName BlackListTodo 处理黑名单
   * @apiGroup BlackList
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiBody {number} userId
   *
   * @apiSuccess {boolean} ret
   */
  @Post('do')
  @UseGuards(JwtAuthGuard)
  async BlackListDo(@Request() req: any, @Body() body: any) {
    const { userId } = body;

    if (userId == req.claims.user.id) {
      return ResponseWrapper.fail(errcode('ERR_BLACKLISTED_SELF_FAILURE'));
    }

    if (
      await this.blacklistService.checkBlackListed(req.claims.user.id, userId)
    ) {
      // 已被拉黑则取消
      if (
        await this.blacklistService.delBlackList(req.claims.user.id, userId)
      ) {
        return ResponseWrapper.ok(null, errcode('ERR_DISMISS_OK'));
      } else {
        return ResponseWrapper.fail(errcode('ERR_DISMISS_FAILURE'));
      }
    } else {
      // 未被拉黑则拉黑
      if (
        await this.blacklistService.addBlackList(req.claims.user.id, userId)
      ) {
        // 取消关注
        await this.followService.disableFollow(req.claims.user.id, userId);
        await this.followService.disableFollow(userId, req.claims.user.id);
        return ResponseWrapper.ok(null, errcode('ERR_BLACKLISTED_OK'));
      } else {
        return ResponseWrapper.fail(errcode('ERR_BLACKLISTED_FAILURE'));
      }
    }
  }
}
