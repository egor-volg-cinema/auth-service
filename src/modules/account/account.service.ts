import {
	ConfirmEmailChangeRequest,
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

		const { code, hash } = await this.otpService.sendOtp(email, 'email')
		console.log(code, ': code')

		await this.accountRepository.upsertPendingChange({
			accountId: userId,
			type: 'email',
			value: email,
			codeHash: hash,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		})

		return { ok: true, message: 'OTP sent to new email.' }
	}

	public async confirmEmailChange(data: ConfirmEmailChangeRequest) {
		const { email, code, userId } = data

		const pending = await this.accountRepository.findPendingChange(
			userId,
			'email'
		)

		if (!pending)
			throw new RpcException({
				code: status.NOT_FOUND,
				details: 'No pending email change found for this email.'
			})

		if (pending.value !== email)
			throw new RpcException({
				code: status.INVALID_ARGUMENT,
				details: 'Email missmatch'
			})

		if (pending.expiresAt < new Date())
			throw new RpcException({
				code: status.NOT_FOUND,
				details: 'Code expired.'
			})

		await this.otpService.verifyOtp(pending.value, code, 'email')

		await this.userRepository.update(userId, {
			email,
			isEmailVerified: true
		})

		await this.accountRepository.deletePendingChange(userId, 'email')

		return { ok: true, message: 'Email updated successfully.' }
	}
}
