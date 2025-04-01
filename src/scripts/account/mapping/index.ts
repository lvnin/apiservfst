/*
 * author: ninlyu.dev@outlook.com
 */
import { LoginController } from '@scripts/account/controller/v1/login.controller';
import { UserController } from '@scripts/account/controller/v1/user.controller';
import { PrivateMessageController } from '@scripts/account/controller/v1/private_message.controller';
import { NotifyController } from '@scripts/account/controller/v1/notify.controller';
import { BlacklistController } from '@scripts/account/controller/v1/blacklist.controller';
import { BlockController } from '@scripts/account/controller/v1/block.controller';
import { FollowController } from '@scripts/account/controller/v1/follow.controller';
import { ForbiddenController } from '@scripts/account/controller/v1/forbidden.controller';
import { UserService } from '@scripts/account/service/user.service';
import { NotifyService } from '@scripts/account/service/notify.service';
import { PrivateMessageService } from '@scripts/account/service/private_message.service';
import { BlacklistService } from '@scripts/account/service/blacklist.service';
import { BlockService } from '@scripts/account/service/block.service';
import { FollowService } from '@scripts/account/service/follow.service';
import { ForbiddenService } from '@scripts/account/service/forbidden.service';

export const accountMapping = {
  controllers: [
    LoginController,
    UserController,
    NotifyController,
    PrivateMessageController,
    BlacklistController,
    BlockController,
    FollowController,
    ForbiddenController,
  ],
  services: [
    UserService,
    NotifyService,
    PrivateMessageService,
    BlacklistService,
    BlockService,
    FollowService,
    ForbiddenService,
  ],
};
