import type {
	TelegramCompleteRequest,
	TelegramCompleteResponse,
	TelegramConsumeRequest,
	TelegramConsumeResponse,
	TelegramInitResponse,
	TelegramVerifyRequest,
	TelegramVerifyResponse
} from '@teacinema/contracts/gen/ts/auth'
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

	@GrpcMethod('AuthService', 'TelegramComplete')
	public async telegramBotComplete(
		data: TelegramCompleteRequest
	): Promise<TelegramCompleteResponse> {
		return this.telegramService.telegramBotComplete(data)
	}

	@GrpcMethod('AuthService', 'TelegramConsume')
	public async telegramConsumeSession(
		data: TelegramConsumeRequest
	): Promise<TelegramConsumeResponse> {
		return this.telegramService.telegramConsumeSession(data)
	}
}
