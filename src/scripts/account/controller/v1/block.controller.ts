/*
 * author: ninlyu.dev@outlook.com
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ResponseWrapper } from '@utils/wrappers';
import { errcode } from '@constant/errcode';
import { JwtAuthGuard } from '@guard/jwt.guard';
import { BlockService } from '@scripts/account/service/block.service';

@Controller('v1/block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  /**
   * @api {get} /block/list
   * @apiName BlockList 屏蔽列表
   * @apiGroup Block
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiQuery {string} blockType
   * @apiQuery {number} page
   * @apiQuery {number} pageSize
   *
   * @apiSuccess {any[]} list
   * @apiSuccess {number} total
   */
  @Get('list')
  @UseGuards(JwtAuthGuard)
  async BlockList(@Request() req: any, @Query() query: any) {
    const { blockType, page, pageSize } = query;
    return ResponseWrapper.ok(
      await this.blockService.getBlockList(
        {
          blocker: req.claims.user.id,
          type: blockType,
        },
        page,
        pageSize,
      ),
    );
  }

  /**
   * @api {post} /block/do
   * @apiName BlockDo 用户屏蔽处理
   * @apiGroup Block
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiBody {number} userId
   * @apiBody {string} blockType
   *
   */
  @Post('do')
  @UseGuards(JwtAuthGuard)
  async BlockDo(@Request() req: any, @Body() body: any) {
    const { userId, blockType } = body;

    if (userId == req.claims.user.id) {
      return ResponseWrapper.fail(errcode('ERR_BLOCKED_SELF_FAILURE'));
    }

    if (
      await this.blockService.checkBlocked(
        req.claims.user.id,
        userId,
        blockType,
      )
    ) {
      // 已屏蔽则取消
      if (
        await this.blockService.delBlock(req.claims.user.id, userId, blockType)
      ) {
        return ResponseWrapper.ok(null, errcode('ERR_DISMISS_OK'));
      } else {
        return ResponseWrapper.fail(errcode('ERR_DISMISS_FAILURE'));
      }
    } else {
      // 未屏蔽则屏蔽
      if (
        await this.blockService.addBlock(req.claims.user.id, userId, blockType)
      ) {
        return ResponseWrapper.ok(null, errcode('ERR_BLOCKED_OK'));
      } else {
        return ResponseWrapper.fail(errcode('ERR_BLOCKED_FAILURE'));
      }
    }
  }
}
