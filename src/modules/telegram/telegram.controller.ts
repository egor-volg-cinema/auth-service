import type { TelegramInitResponse } from '@egorcolgcinema/contracts/gen/auth'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { TelegramService } from './telegram.service'

@Controller()
export class TelegramController {
	public constructor(private readonly telegramService: TelegramService) {}

	@GrpcMethod('AuthService', 'TelegramInit')
	public async getTelegramBotAuthUrl(): Promise<TelegramInitResponse> {
		return await this.telegramService.getTelegramBotAuthUrl()
	}
}
