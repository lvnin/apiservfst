/*
 * author: ninlyu.dev@outlook.com
 */
import { Controller, Post, Body } from '@nestjs/common';
import { ResponseWrapper } from '@utils/wrappers';
import { errcode } from '@constant/errcode';
import { ForbiddenService } from '@scripts/account/service/forbidden.service';
import { AppealStatsEnum } from '@scripts/account/model/user_forbidden.model';

@Controller('v1/forbidden')
export class ForbiddenController {
  constructor(private readonly forbiddenService: ForbiddenService) {}

  /**
   * @api {post} /forbidden/appeal
   * @apiName ForbiddenAppeal 封禁申诉
   * @apiGroup Forbidden
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apibody {number} forbiddenId
   * @apiBody {string} appealContent
   *
   */
  @Post('appeal')
  async ForbiddenAppeal(@Body() body: any) {
    const { forbiddenId, appealContent } = body;

    // 判断申诉次数
    const appealTimes = await this.forbiddenService.getAppealCount(forbiddenId);
    if (appealTimes == 0) {
      return ResponseWrapper.fail(errcode('ERR_APPEAL_NO_TIMES'));
    }

    if (!(await this.forbiddenService.checkAppeal(forbiddenId))) {
      return ResponseWrapper.fail(errcode('ERR_APPEAL_OK'));
    }

    if (
      !(await this.forbiddenService.setForbiddenData(
        { id: forbiddenId },
        {
          appealTimes: appealTimes - 1,
          appealContent,
          appealAt: new Date(),
          status: AppealStatsEnum.DISABLED,
        },
      ))
    ) {
      return ResponseWrapper.fail(errcode('ERR_APPEAL_FAILURE'));
    }

    return ResponseWrapper.ok(
      {
        forbiddenData:
          await this.forbiddenService.getForbiddenData(forbiddenId),
      },
      errcode('ERR_APPEAL_OK'),
    );
  }
}
