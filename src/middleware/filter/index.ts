import { GlobalExceptionFilter } from '@/middleware/filter/exception.filter';

export const loadGlobalFilters = (app: any) => {
  app.useGlobalFilters(new GlobalExceptionFilter());
};
