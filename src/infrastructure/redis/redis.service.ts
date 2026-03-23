import {
	Injectable,
	Logger,
	type OnModuleDestroy,
	type OnModuleInit
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Redis } from 'ioredis'

@Injectable()
export class RedisService
	extends Redis
	implements OnModuleDestroy, OnModuleInit
{
	private readonly logger = new Logger(RedisService.name)

	public constructor(private readonly configService: ConfigService) {
		super({
			// username: configService.getOrThrow<string>('REDIS_USER'),
			password: configService.get('REDIS_PASSWORD'),
			host: configService.get('REDIS_HOST'),
			port: configService.get('REDIS_PORT'),
			maxRetriesPerRequest: 5,
			enableOfflineQueue: true
		})
	}

	public async onModuleInit() {
		const start = Date.now()

		this.logger.log('Initializing redis...')

		this.on('connect', () =>
			this.logger.log('connected to redis successfully')
		)

		this.on('ready', () => {
			const ms = Date.now() - start
			this.logger.log(`Redis connected successfully (time=${ms}ms)`)
		})

		this.on('error', error => {
			this.logger.error('redis connection error', {
				error: error.message ?? error
			})
		})

		this.on('close', () => {
			this.logger.warn('redis connection closed')
		})

		this.on('reconnecting', () => {
			this.logger.warn('reconnecting to redis...')
		})
	}

	public async onModuleDestroy() {
		this.logger.log('disconnecting from redis...')

		try {
			this.quit()
			this.logger.log('disconnected from redis successfully')
		} catch (error) {
			this.logger.error('failed to disconnect from redis', error)
			throw new Error('')
		}
	}
}
