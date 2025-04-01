/*
 * author: ninlyu.dev@outlook.com
 */
import { errcode } from '@constant/errcode';
import { ResponseWrapper } from '@utils/wrappers';
import { JwtAuthGuard } from '@guard/jwt.guard';
import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Request,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FollowService } from '@scripts/account/service/follow.service';
import { BlacklistService } from '@scripts/account/service/blacklist.service';

@Controller('v1/follow')
export class FollowController {
  constructor(
    private readonly followService: FollowService,
    private readonly blacklistService: BlacklistService,
  ) {}

  /**
   * @api {post} /follow/do
   * @apiName FollowDo 用户关注
   * @apiGroup Follow
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiBody {number} userId
   *
   * @apiSuccess {boolean} isFollowing
   */
  @Post('do')
  @UseGuards(JwtAuthGuard)
  async FollowDo(@Request() req: any, @Body() body: any) {
    const { userId } = body;

    if (userId == req.claims.user.id) {
      return ResponseWrapper.fail(errcode('ERR_FOLLOWING_SELF_FAILURE'));
    }

    // 判断对方是否把我加入了黑名单
    if (
      await this.blacklistService.checkBlackListed(userId, req.claims.user.id)
    ) {
      return ResponseWrapper.fail(errcode('ERR_BLACKLISTED_FOLLOWING_FAILURE'));
    }

    let isFollowing: boolean;
    if (await this.followService.isFollowing(req.claims.user.id, userId)) {
      // 已关注则取消关注
      if (
        !(await this.followService.disableFollow(req.claims.user.id, userId))
      ) {
        return ResponseWrapper.fail(errcode('ERR_DISMISS_FAILURE'));
      }

      isFollowing = false;
    } else {
      // 未关注则关注
      if (
        !(await this.followService.enableFollow(req.claims.user.id, userId))
      ) {
        return ResponseWrapper.fail(errcode('ERR_FOLLOW_FAILURE'));
      }

      isFollowing = true;
    }

    return ResponseWrapper.ok({ isFollowing });
  }

  /**
   * @api {get} /follow/list/:tab
   * @apiName FollowList 关注列表
   * @apiGroup Follow
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiQuery {number} page
   * @apiQuery {number} pageSize
   *
   * @apiSuccess {any[]} list
   * @apiSuccess {number} total
   */
  @Get('list/:tab')
  @UseGuards(JwtAuthGuard)
  async UserFollowList(
    @Request() req: any,
    @Query() query: any,
    @Param() param: any,
  ) {
    const { page, pageSize } = query;
    let data = { list: [], total: 0 };
    switch (param.tab) {
      case 'follows':
        data = await this.followService.getFollowList(
          req.claims.user.id,
          page,
          pageSize,
        );
        break;
      case 'fans':
        data = await this.followService.getFansList(
          req.claims.user.id,
          page,
          pageSize,
        );
        break;
      default:
        break;
    }

    return ResponseWrapper.ok(data);
  }
}
