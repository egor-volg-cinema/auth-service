import { Module } from '@nestjs/common'

import { TelegramController } from './telegram.controller'
import { TelegramRepository } from './telegram.repository'
import { TelegramService } from './telegram.service'

@Module({
	controllers: [TelegramController],
	providers: [TelegramService, TelegramRepository]
})
export class TelegramModule {}
