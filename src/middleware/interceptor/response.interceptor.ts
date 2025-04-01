import logger from '@utils/logger';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const st = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    return next.handle().pipe(
      map((data) => {
        logger.debug(
          `[RES] {${request.url.split('?')[0]}, ${
            request.method
          }} ${JSON.stringify(data)} +${Date.now() - st}ms`,
        );
        return data;
      }),
    );
  }
}
