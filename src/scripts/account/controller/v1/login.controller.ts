/*
 * author: ninlyu.dev@outlook.com
 */
import { errcode } from '@constant/errcode';
import { QuerySessionInfo } from '@scripts/account/constant/query/user.query';
import { UserStatsEnum } from '@scripts/account/model/user.model';
import { UserService } from '@scripts/account/service/user.service';
import { md5Secret } from '@utils/security';
import { captchaCode, ip2Region } from '@utils/function';
import validator from '@utils/validator';
import { ResponseWrapper } from '@utils/wrappers';
import { Request, Body, Controller, Param, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { config } from '@/config';
import DateTime from '@utils/datetime';
import { smsSdk } from '@sdk/sms';
import logger from '@utils/logger';
import { ForbiddenService } from '@scripts/account/service/forbidden.service';

@Controller('v1/login')
export class LoginController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly forbiddenService: ForbiddenService,
  ) {}

  /**
   * @api {post} /login/signin/:tab
   * @apiName LoginSignIn 用户登录
   * @apiGroup Login
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiBody {string} mobile
   * @apiBody {string} [password]
   *
   */
  @Post('signin/:tab')
  async LoginSignIn(@Param() param: any, @Body() body: any) {
    if (param.tab === 'account') {
      const { password } = body;
      if (password) {
        body.password = md5Secret.encode(password);
      }
    }

    body['status'] = UserStatsEnum.NORMAL;

    const userData = await this.userService.getUser(body, QuerySessionInfo());

    if (param.tab === 'mobile') {
      if (validator.isNULL(userData)) {
        // 没有账号数据需要跳转注册
        return ResponseWrapper.fail(errcode('ERR_ACCOUNT_UNREGISTERED'));
      }
    }

    // 判断账号是否存在或是否被封禁或是否已销毁
    if (validator.isNULL(userData)) {
      return ResponseWrapper.fail(errcode('ERR_LOGON_FAILURE'));
    } else if (
      await this.forbiddenService.isForbidden(userData.id, userData.forbidden)
    ) {
      return ResponseWrapper.fail(errcode('ERR_ACCOUNT_FORBIDDEN'), {
        forbiddenData: {
          ...(await this.forbiddenService.getForbiddenData(userData.forbidden)),
          ...{ user: userData },
        },
      });
    } else if (userData.status == UserStatsEnum.DESTROYED) {
      return ResponseWrapper.fail(errcode('ERR_ACCOUNT_WAS_DESTROYED'));
    }

    const token = this.jwtService.sign({
      user: userData,
    });

    return ResponseWrapper.ok(
      {
        userData,
        token,
      },
      errcode('ERR_LOGON_SUCCESS'),
    );
  }

  /**
   * @api {post} /login/captcha/:tab
   * @apiName LoginCaptcha 验证码发送
   * @apiGroup Login
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiParam {string} tab
   * @apiBody {string} [mobile]
   *
   */
  @Post('captcha/:tab')
  async LoginCaptcha(@Param() param: any, @Body() body: any) {
    switch (param.tab) {
      case 'mobile':
        return this._sendMobileCaptcha(body);
      default:
        return ResponseWrapper.fail(errcode('ERR_SENT_FAILURE'));
    }
  }

  // _sendMobileCaptcha - 发送手机验证码
  // @param mobile string
  // @returns
  async _sendMobileCaptcha({ mobile, captchaSize }) {
    let result: any;
    const smsCode = captchaCode(captchaSize ?? 4);
    try {
      result = await smsSdk.sendSms({
        mobile,
        smsCode,
      });
    } catch (e) {
      logger.error(e);
    }

    return result?.Code == 'OK'
      ? ResponseWrapper.ok(
          {
            smsData: {
              mobile,
              smsCode,
              sentTime: DateTime.now(),
              expiresIn: Number(config.captcha.expiresin),
            },
          },
          errcode('ERR_SENT_SUCCESS'),
        )
      : ResponseWrapper.fail(errcode('ERR_SENT_FAILURE'));
  }

  /**
   * @api {post} /login/signup
   * @apiName LoginSignUp 用户注册
   * @apiGroup Login
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiBody {string} mobile
   * @apiBody {string} username
   * @apiBody {string} nickname
   *
   */
  @Post('signup')
  async LoginSignUp(@Request() req: any, @Body() body: any) {
    const { mobile, username, nickname } = body;

    if (
      await this.userService.checkUser({
        mobile,
        status: UserStatsEnum.NORMAL,
      })
    ) {
      return ResponseWrapper.fail(errcode('ERR_ACCOUNT_EXISTS'));
    }

    // 创建新账号
    await this.userService.createUser({
      mobile,
      username,
      nickname,
      location: ip2Region(req),
    });

    const userData = await this.userService.getUser(
      { mobile, status: UserStatsEnum.NORMAL },
      QuerySessionInfo(),
    );

    if (validator.isNULL(userData)) {
      return ResponseWrapper.fail(errcode('ERR_ACCOUNT_SIGNUP_FAILURE'));
    }

    const token = this.jwtService.sign({
      user: userData,
    });

    return ResponseWrapper.ok(
      {
        userData,
        token,
      },
      errcode('ERR_LOGON_SUCCESS'),
    );
  }
}
