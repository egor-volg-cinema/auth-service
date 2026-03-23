import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/generated/client'

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(PrismaService.name)

	public constructor(private readonly configService: ConfigService) {
		const adapter = new PrismaPg({
			user: configService.get('POSTGRES_USER'),
			password: configService.get('POSTGRES_PASSWORD'),
			host: configService.get('POSTGRES_HOST'),
			port: configService.get('POSTGRES_PORT'),
			database: configService.get('POSTGRES_DATABASE')
		})

		super({
			adapter
		})
	}

	public async onModuleInit() {
		const start = Date.now()
		this.logger.log('connecting to database...')

		try {
			await this.$connect()
			const ms = Date.now() - start
			this.logger.log(`connected to database in ${ms}ms`)
		} catch (error) {
			this.logger.error('failed to connect to database', error)

			throw error
		}
	}

	public async onModuleDestroy() {
		this.logger.log('disconnecting from database...')
		try {
			await this.$disconnect()

			this.logger.log('disconnected from database successfully')
		} catch (error) {
			this.logger.error('failed to disconnect from database', error)
		}
	}
}
