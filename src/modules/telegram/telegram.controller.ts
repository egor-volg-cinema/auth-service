import type {
	TelegramInitResponse,
	TelegramVerifyRequest,
	TelegramVerifyResponse
} from '@egorcolgcinema/contracts/gen/auth'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { TelegramService } from './telegram.service'

@Controller()
export class TelegramController {
	public constructor(private readonly telegramService: TelegramService) {}

	@GrpcMethod('AuthService', 'TelegramInit')
	public async getTelegramBotAuthUrl(): Promise<TelegramInitResponse> {
		return this.telegramService.getTelegramBotAuthUrl()
	}

	@GrpcMethod('AuthService', 'TelegramVerify')
	public async getTelegramBotVerify(
		query: TelegramVerifyRequest
	): Promise<TelegramVerifyResponse> {
		return this.telegramService.getTelegramBotVerify(query)
	}
}
