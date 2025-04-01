import { ResponseWrapper } from '@utils/wrappers';
import { FastifyRequest, FastifyReply } from 'fastify';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  QueryFailedError,
  EntityNotFoundError,
  CannotCreateEntityIdMapError,
} from 'typeorm';
import logger from '@utils/logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(),
      response = ctx.getResponse<FastifyReply>(),
      request = ctx.getRequest<FastifyRequest>();
    let message = (exception as any).message.message;
    //let code = 'HttpException';

    logger.error(
      message,
      (exception as any).stack,
      `${request.method} ${request.url}`,
    );

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    switch (exception.constructor) {
      case HttpException:
        status = (exception as HttpException).getStatus();
        message = (exception as HttpException).message;
        break;
      case QueryFailedError: // this is a TypeOrm error
        status = HttpStatus.OK;
        message = (exception as QueryFailedError).message;
        //code = (exception as any).code;
        break;
      case EntityNotFoundError: // this is another TypeOrm error
        status = HttpStatus.OK;
        message = (exception as EntityNotFoundError).message;
        //code = (exception as any).code;
        break;
      case CannotCreateEntityIdMapError: // and another
        status = HttpStatus.OK;
        message = (exception as CannotCreateEntityIdMapError).message;
        //code = (exception as any).code;
        break;
      default:
        status = HttpStatus.OK;
    }

    response.status(status).send(
      ResponseWrapper.fail({
        code: HttpStatus.UNPROCESSABLE_ENTITY,
        message,
      }),
    );
  }
}
