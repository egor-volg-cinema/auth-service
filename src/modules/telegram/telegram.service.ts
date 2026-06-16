import type { TelegramVerifyRequest } from '@egorcolgcinema/contracts/gen/auth'
import { RedisService } from '@infrastructure/redis/redis.service'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config/dist/config.service'
import { randomBytes } from 'crypto'

import { TelegramRepository } from './telegram.repository'

@Injectable()
export class TelegramService {
	private readonly TELEGRAM_BOT_ID: string
	private readonly TELEGRAM_BOT_TOKEN: string
	private readonly TELEGRAM_BOT_USERNAME: string
	private readonly TELEGRAM_REDIRECT_ORIGIN: string

	public constructor(
		private readonly redisService: RedisService,
		private readonly telegramRepository: TelegramRepository,
		private readonly configService: ConfigService
	) {
		this.TELEGRAM_BOT_ID =
			this.configService.getOrThrow<string>('TELEGRAM_BOT_ID')

		this.TELEGRAM_BOT_TOKEN =
			this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN')

		this.TELEGRAM_BOT_USERNAME = this.configService.getOrThrow<string>(
			'TELEGRAM_BOT_USERNAME'
		)
		this.TELEGRAM_REDIRECT_ORIGIN = this.configService.getOrThrow<string>(
			'TELEGRAM_REDIRECT_ORIGIN'
		)
	}

	public getTelegramBotAuthUrl() {
		const url = new URL('https://oauth.telegram.org/auth')
		url.searchParams.append('bot_id', this.TELEGRAM_BOT_ID.toString())
		url.searchParams.append('origin', this.TELEGRAM_REDIRECT_ORIGIN)
		url.searchParams.append('request_access', 'write')
		url.searchParams.append('return_to', this.TELEGRAM_REDIRECT_ORIGIN)

		return { url: url.href }
	}

	public async verify(data: TelegramVerifyRequest) {
		const telegramId = data.data.id

		const exists =
			await this.telegramRepository.findByTelegramId(telegramId)

		if (exists && exists.phone)
			return {
				accessToken: '2',
				refreshToken: '2'
			}

		const sessionId = randomBytes(16).toString('hex')

		await this.redisService.set(
			`telegram_session:${sessionId}`,
			JSON.stringify({ telegramId, username: data.data.username }),
			'EX',
			300
		)

		return {
			url: `https://t.me/${this.TELEGRAM_BOT_USERNAME}?start=${sessionId}`
		}
	}
}
