import { UserRepository } from '@modules/shared'
import { TokenModule } from '@modules/token/token.module'
import { TokenService } from '@modules/token/token.service'
import { Module } from '@nestjs/common'

import { TelegramController } from './telegram.controller'
import { TelegramRepository } from './telegram.repository'
import { TelegramService } from './telegram.service'

@Module({
	imports: [TokenModule],
	controllers: [TelegramController],
	providers: [
		TelegramService,
		TelegramRepository,
		UserRepository,
		TokenService
	]
})
export class TelegramModule {}
