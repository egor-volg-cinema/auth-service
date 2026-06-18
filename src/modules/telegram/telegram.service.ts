import type { TelegramVerifyRequest } from '@egorcolgcinema/contracts/gen/auth'
import { status } from '@grpc/grpc-js'
import { RedisService } from '@infrastructure/redis/redis.service'
import { TokenService } from '@modules/token/token.service'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config/dist/config.service'
import { RpcException } from '@nestjs/microservices'
import { createHash, createHmac, randomBytes } from 'crypto'

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
		private readonly tokenService: TokenService,
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

	public async getTelegramBotVerify(query: TelegramVerifyRequest) {
		const isValid = this.checkTelegramAuth(query.query)
		if (!isValid)
			throw new RpcException({
				code: status.UNAUTHENTICATED,
				details: 'Invalid Telegram signature'
			})

		const telegramId = query.query.id

		const exists =
			await this.telegramRepository.findByTelegramId(telegramId)

		if (exists && exists.phone)
			return this.tokenService.generateToken(exists.id)

		const sessionId = randomBytes(16).toString('hex')

		await this.redisService.set(
			`telegram_session:${sessionId}`,
			JSON.stringify({ telegramId, username: query.query.username }),
			'EX',
			300
		)

		return {
			url: `https://t.me/${this.TELEGRAM_BOT_USERNAME}?start=${sessionId}`
		}
	}

	private async checkTelegramAuth(query: Record<string, string>) {
		const hash = query.hash

		if (!hash) return false

		const dataCheckArray = Object.keys(query)
			.filter(key => key !== 'hash')
			.sort()
			.map(key => `${key}=${query[key]}`)
		const dataCheckString = dataCheckArray.join('\n')
		const secretKey = createHash('sha256')
			.update(`${this.TELEGRAM_BOT_ID}:${this.TELEGRAM_BOT_TOKEN}`)
			.digest('hex')
		const hmac = createHmac('sha256', secretKey)
			.update(dataCheckString)
			.digest('hex')

		return hash === hmac
	}
}
