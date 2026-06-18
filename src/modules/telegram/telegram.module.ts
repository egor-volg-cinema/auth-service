import { TokenModule } from '@modules/token/token.module'
import { Module } from '@nestjs/common'

import { TelegramController } from './telegram.controller'
import { TelegramRepository } from './telegram.repository'
import { TelegramService } from './telegram.service'

@Module({
	imports: [TokenModule],
	controllers: [TelegramController],
	providers: [TelegramService, TelegramRepository]
})
export class TelegramModule {}
