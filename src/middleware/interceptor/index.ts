import { RequestInterceptor } from '@/middleware/interceptor/request.interceptor';
import { ResponseInterceptor } from '@/middleware/interceptor/response.interceptor';
import { HttpStatusInterceptor } from '@/middleware/interceptor/status.interceptor';

export const loadGlobalInterceptors = (app: any) => {
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalInterceptors(new RequestInterceptor());
  app.useGlobalInterceptors(new HttpStatusInterceptor());
};
