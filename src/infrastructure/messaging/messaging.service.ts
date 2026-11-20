import type { EmailChangedEvent, OtpRequestedEvent } from '@teacinema/contracts'
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class MessagingService {
	public constructor(
		@Inject('NOTIFICATION_CLIENT') private readonly client: ClientProxy
	) { }

	public async otpRequested(data: OtpRequestedEvent) {
		return this.client.emit('auth.otp.requested', data)
	}
	public async emailChanged(data: EmailChangedEvent) {
		return this.client.emit('account.email.changed', data)
	}
}
