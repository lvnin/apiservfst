/*
 * author: ninlyu.dev@outlook.com
 */
import { Controller, Head } from '@nestjs/common';

@Controller('/')
export class RouterController {
  constructor() {}

  @Head('heartbeat')
  Heartbeat() {}
}
