/*
 * author: ninlyu.dev@outlook.com
 */
import { errcode } from '@constant/errcode';
import {
  QueryProfileInfo,
  QuerySessionInfo,
} from '@scripts/account/constant/query/user.query';
import { UserService } from '@scripts/account/service/user.service';
import { HttpWrapper, ResponseWrapper } from '@utils/wrappers';
import { JwtAuthGuard, JwtLooseAuthGuard } from '@guard/jwt.guard';
import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { UserStatsEnum } from '@scripts/account/model/user.model';
import { Not } from 'typeorm';
import { md5Secret } from '@utils/security';
import { config } from '@/config';
import { ip2Region } from '@utils/function';
import { JwtService } from '@nestjs/jwt';
import { BlacklistService } from '@scripts/account/service/blacklist.service';
import { BlockService } from '@scripts/account/service/block.service';
import validator from '@utils/validator';

@Controller('v1/user')
export class UserController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly blacklistService: BlacklistService,
    private readonly blockService: BlockService,
  ) {}

  /**
   * @api {get} /user/info
   * @apiName UserInfo 用户信息
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiQuery {number} userId
   *
   * @apiSuccess {object} userData
   */
  @Get('info')
  @UseGuards(JwtLooseAuthGuard)
  async UserInfo(@Request() req: any, @Query() query: any) {
    const { userId } = query;

    const selfUserId = req.claims?.user?.id ?? 0;

    const userData = await this.userService.getUser(
      {
        id: userId,
        status: UserStatsEnum.NORMAL,
      },
      QueryProfileInfo(),
      {
        selfUserId,
        followerId: selfUserId,
      },
    );

    if (validator.isNULL(userData)) {
      return ResponseWrapper.ok({ userData });
    }

    const isBlacklisted = await this.blacklistService.checkBlackListed(
      selfUserId,
      userId,
    );

    const totalData = await this.userService.getUserTotalData(userId, {
      selfUserId,
    });

    if (await this.blacklistService.isBlackListed(selfUserId, userId)) {
      totalData.followTotal = totalData.fansTotal = 0;
    } else {
      // block
    }

    return ResponseWrapper.ok({
      userData: {
        ...userData,
        isBlacklisted,
        totalData,
      },
    });
  }

  /**
   * @api {get} /user/profile
   * @apiName UserProfile 用户资料
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiSuccess {object} userData
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async UserProfile(@Request() req: any, @Query() query: any) {
    const userId = req.claims?.user?.id ?? 0;

    const userData = await this.userService.getUser(
      {
        id: userId,
      },
      QueryProfileInfo(),
      {
        selfUserId: userId,
      },
    );

    if (validator.isNULL(userData)) {
      return ResponseWrapper.ok({ userData });
    }

    return ResponseWrapper.ok({
      userData: {
        ...userData,
        totalData: await this.userService.getUserTotalData(userId, {
          selfUserId: userId,
        }),
        behaviorData: await this.userService.getUserBehaviorData(userId),
      },
    });
  }

  /**
   * @api {get} /user/list
   * @apiName UserList 用户列表
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiQuery {string} kw
   * @apiQuery {number} page
   * @apiQuery {number} pageSize
   *
   * @apiSuccess {any[]} list
   * @apiSuccess {number} total
   */
  @Get('list')
  @UseGuards(JwtLooseAuthGuard)
  async UserList(@Request() req: any, @Query() query: any) {
    const { kw, page, pageSize } = query;
    const data = await this.userService.getUserList(page, pageSize, {
      kw,
      selfUserId: req.claims?.user?.id ?? 0,
    });
    return ResponseWrapper.ok(data);
  }

  /**
   * @api {post} /user/update/:tab
   * @apiName UserUpdate 用户资料
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiParam {string} tab profile|pass
   *
   * @apiBody {string} [mobile]
   * @apiBody {string} [username]
   * @apiBody {string} [password]
   * @apiBody {string} [avatar]
   * @apiBody {string} [nickname]
   * @apiBody {Number} [gender]
   * @apiBody {String} [bio]
   *
   */
  @Post('update/:tab')
  @UseGuards(JwtAuthGuard)
  async UserUpdate(
    @Request() req: any,
    @Param() param: any,
    @Body() body: any,
  ) {
    const userId = req.claims.user.id;
    switch (param.tab) {
      case 'profile':
        return this._updateProfile(userId, body);
      case 'mobile':
        const { mobile } = body;
        return this._updateUser(
          userId,
          {
            mobile,
          },
          null,
        );
      case 'pass':
        const { password } = body;
        return this._updateUser(
          userId,
          {
            password: md5Secret.encode(password),
          },
          null,
        );
      case 'bgpic':
        const { bgpic } = body;
        return this._updateUser(
          userId,
          {
            bgpic,
          },
          null,
        );
      case 'location':
        return this._updateUser(
          userId,
          {
            location: ip2Region(req),
          },
          null,
        );
    }

    return ResponseWrapper.fail(errcode('ERR_UPDATE_FAILURE'));
  }

  // _updateUser - 更新用户资料
  // @param userId number
  // @param sets object
  // @returns
  async _updateUser(userId: number, sets: any, token: any) {
    if (
      !(await this.userService.setUser(
        {
          id: userId,
        },
        sets,
      ))
    ) {
      return ResponseWrapper.fail(errcode('ERR_UPDATE_FAILURE'));
    }
    return ResponseWrapper.ok(
      {
        token,
      },
      errcode('ERR_UPDATE_SUCCESS'),
    );
  }

  // _updateProfile - 更新用户资料
  // @param userId number
  // @param username string
  // @param nickname string
  // @param gender string
  // @param bio string
  // @returns
  async _updateProfile(
    userId: any,
    { avatar, username, nickname, gender, bio },
  ) {
    const token = this.jwtService.sign({
      user: await this.userService.getUser({ id: userId }, QuerySessionInfo()),
    });

    return await this._updateUser(
      userId,
      {
        avatar,
        username,
        nickname,
        gender,
        bio,
      },
      token,
    );
  }

  /**
   * @api {post} /user/check/:tab
   * @apiName UserCheck 用户验证
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiSuccess {boolean} valid
   */
  @Post('check/:tab')
  async UserCheck(@Param() param: any, @Body() body: any) {
    switch (param.tab) {
      case 'repeat':
        return ResponseWrapper.ok({
          valid: !(await this.userService.checkUser({
            ...body,
            status: Not(UserStatsEnum.DESTROYED),
          })),
        });
      case 'oldpass':
        const { mobile, password } = body;
        const userData = await this.userService.getUser(
          {
            mobile,
          },
          { mobile: true, password: true },
        );

        return ResponseWrapper.ok(
          {
            valid:
              userData != null &&
              (userData.password == null ||
                userData.password == md5Secret.encode(password)),
          },
          errcode('ERR_UPDATE_SUCCESS'),
        );
      default:
        return ResponseWrapper.fail(errcode('ERR_PARAMETER_FAILURE'));
    }
  }

  /**
   * @api {post} /user/del
   * @apiName UserDel 用户注销
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiBody {string} realName
   * @apiBody {string} idCardNo
   *
   * @apiSuccess {boolean} valid
   */
  @Post('del')
  @UseGuards(JwtAuthGuard)
  async UserDel(@Request() req: any) {
    if (
      !(await this.userService.setUser(
        { id: req.claims.user.id },
        {
          status: UserStatsEnum.DESTROYED,
        },
      ))
    ) {
      return ResponseWrapper.fail(errcode('ERR_ACCOUNT_DESTROY_FAILURE'));
    }

    return ResponseWrapper.ok(null, errcode('ERR_ACCOUNT_WAS_DESTROYED_OK'));
  }

  /**
   * @api {post} /user/certification
   * @apiName UserCertification 用户验证
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiBody {string} realName
   * @apiBody {string} idCardNo
   *
   * @apiSuccess {boolean} valid
   */
  @Post('certification')
  @UseGuards(JwtAuthGuard)
  async UserCertification(@Request() req: any, @Body() body: any) {
    const { realName, idCardNo } = body;

    // 判断身份证是否已被实名认证
    if (
      await this.userService.getUser(
        { idCardNo, status: Not(UserStatsEnum.DESTROYED) },
        { id: true },
      )
    ) {
      return ResponseWrapper.fail(errcode('ERR_ACCOUNT_WAS_AUTHED'));
    }

    const result = await HttpWrapper.post(
      config.sdk.idenauth.authUrl,
      `idNo=${idCardNo}&name=${realName}`,
      {
        Authorization: `APPCODE ${config.sdk.idenauth.appCode}`,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
    );

    if (result.respCode == '0000') {
      if (
        !(await this.userService.setUser(
          { id: req.claims.user.id },
          { isAuth: true, idCardNo, realName },
        ))
      ) {
        return ResponseWrapper.fail(errcode('ERR_SERVER_INTERNAL_ERROR'));
      }

      return ResponseWrapper.ok(null, errcode('ERR_AUTH_SUCCESS'));
    } else {
      return ResponseWrapper.fail({ code: 1, message: result.respMessage });
    }
  }

  /**
   * @api {get} /user/behavior
   * @apiName UserBehavior 用户红点
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiDescription 接口
   *
   * @apiSuccess {any} behaviorData
   */
  @Get('behavior')
  @UseGuards(JwtLooseAuthGuard)
  async UserBehavior(@Request() req: any) {
    return ResponseWrapper.ok({
      behaviorData: validator.isNULL(req.claims)
        ? null
        : await this.userService.getUserBehaviorData(req.claims.user.id),
    });
  }
}
