import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'

import { MessagingService } from './messaging.service'

@Global()
@Module({
	imports: [
		ClientsModule.registerAsync([
			{
				name: 'NOTIFICATION_CLIENT',
				inject: [ConfigService],
				useFactory: (configService: ConfigService) => ({
					transport: Transport.RMQ,
					options: {
						urls: [configService.get<string>('RMQ_URL')!],
						queue: 'notification_queue',
						queueOptions: {
							durable: true
						}
					}
				})
			}
		])
	],

	providers: [MessagingService],
	exports: [MessagingService]
})
export class MessagingModule {}
