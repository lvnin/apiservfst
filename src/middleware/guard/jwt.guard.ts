/*
 * author: ninlyu.dev@outlook.com
 */
import { config } from '@/config';
import DateTime from '@utils/datetime';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { UserService } from '@scripts/account/service/user.service';
import { JwtService } from '@nestjs/jwt';
import { ResponseWrapper } from '@utils/wrappers';
import { errcode } from '@constant/errcode';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-token'];
    if (!token) {
      const response = context.switchToHttp().getResponse<FastifyReply>();
      response
        .status(401)
        .send(ResponseWrapper.fail(errcode('ERR_TOKEN_INVALID')));
      return false;
    }

    try {
      const claims = this.jwtService.verify(token);

      request.claims = claims;

      const result = await this.userService.doDetectingAccount(
        claims?.user?.id,
      );
      if (result.code != 0) {
        const response = context.switchToHttp().getResponse<FastifyReply>();
        response.status(401).send(ResponseWrapper.fail(result));
        return false;
      }

      if (
        claims.exp - DateTime.now(false) <
        DateTime.parseDuration(config.jwt.bufferTime, false)
      ) {
        const response = context.switchToHttp().getResponse();
        response.header(
          'new-x-token',
          this.jwtService.sign({ user: claims.user }),
        );

        return true;
      }

      return true;
    } catch (error) {
      const response = context.switchToHttp().getResponse<FastifyReply>();
      response
        .status(401)
        .send(ResponseWrapper.fail(errcode('ERR_TOKEN_EXPIRED')));
      return false;
    }
  }
}

@Injectable()
export class JwtLooseAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-token'];
    if (!token) {
      return true;
    }

    try {
      const claims = this.jwtService.verify(token);

      request.claims = claims;

      const result = await this.userService.doDetectingAccount(
        claims?.user?.id,
      );
      if (result.code != 0) {
        const response = context.switchToHttp().getResponse<FastifyReply>();
        response.status(401).send(ResponseWrapper.fail(result));

        return false;
      }

      if (
        claims.exp - DateTime.now(false) <
        DateTime.parseDuration(config.jwt.bufferTime, false)
      ) {
        const response = context.switchToHttp().getResponse();
        response.header(
          'new-x-token',
          this.jwtService.sign({ user: claims.user }),
        );
      }

      return true;
    } catch (error) {
      return true;
    }
  }
}
