import logger from '@utils/logger';
import { getClientIp } from '@utils/function';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const st = Date.now();
    const request = context.switchToHttp().getRequest();
    return next
      .handle()
      .pipe(
        tap(() =>
          logger.debug(
            `[REQ] ${getClientIp(request)} | ${request.method} ${request.url}${
              request.method == 'POST' ? ` ${JSON.stringify(request.body)}` : ''
            } +${Date.now() - st}ms`,
          ),
        ),
      );
  }
}
