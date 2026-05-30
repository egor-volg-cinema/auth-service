import {
	GetAccountRequest,
	InitEmailChangeRequest,
	Role
} from '@egorcolgcinema/contracts/gen/account'
import { status } from '@grpc/grpc-js'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

import { convertEnum } from '@/enums'

import { OtpService } from '../otp/otp.service'
import { UserRepository } from '../shared'

import { AccountRepository } from './account.repository'

@Injectable()
export class AccountService {
	public constructor(
		private readonly accountRepository: AccountRepository,
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService
	) {}
	public async getAccount(data: GetAccountRequest) {
		const { id } = data

		const account = await this.accountRepository.findById(id)
		if (!account)
			throw new RpcException({
				code: status.NOT_FOUND,
				details: 'Account not found.'
			})

		return {
			id: account.id,
			phone: account.phone || '',
			email: account.email || '',
			isPhoneVerified: account.isPhoneVerified,
			isEmailVerified: account.isEmailVerified,
			role: convertEnum(Role, account.role)
		}
	}

	public async initEmailChange(data: InitEmailChangeRequest) {
		const { userId, email } = data

		const existingAccount = await this.userRepository.findByEmail(email)

		if (existingAccount)
			throw new RpcException({
				code: status.ALREADY_EXISTS,
				details: 'Email is already in use.'
			})

		const code = await this.otpService.sendOtp(email, 'email')
	}
}
