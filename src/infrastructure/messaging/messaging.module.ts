import { Global, Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'

import { MessagingService } from './messaging.service'

@Global()
@Module({
	imports: [
		ClientsModule.registerAsync([
			{
				name: 'NOTIFICATION_CLIENT',
				useFactory: () => ({
					transport: Transport.RMQ,
					options: {
						urls: ['amqp://GUEST:123456@localhost:5672'],
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
export class MessagingModule { }
