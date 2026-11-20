import type {
	ConfirmEmailChangeRequest,
	ConfirmPhoneChangeRequest,
	GetAccountRequest,
	InitEmailChangeRequest,
	InitPhoneChangeRequest
} from '@teacinema/contracts/gen/ts/account'
import { convertEnum } from '@enums'
import { status } from '@grpc/grpc-js'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

import { OtpService } from '../otp/otp.service'
import { UserRepository } from '../shared'

import { AccountRepository } from './account.repository'
import { MessagingService } from '@infrastructure/messaging/messaging.service'

const Role = { USER: 0, ADMIN: 1, UNRECOGNIZED: -1 } as const

@Injectable()
export class AccountService {
	public constructor(
		private readonly messagingService: MessagingService,
		private readonly accountRepository: AccountRepository,
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService
	) { }
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


		await this.messagingService.emailChanged({
			email,
			code
		})

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

	public async initPhoneChange(data: InitPhoneChangeRequest) {
		const { userId, phone } = data

		const existingAccount = await this.userRepository.findByPhone(phone)

		if (existingAccount)
			throw new RpcException({
				code: status.ALREADY_EXISTS,
				details: 'Phone is already in use.'
			})

		const { code, hash } = await this.otpService.sendOtp(phone, 'phone')
		console.log(code, ': code')

		await this.accountRepository.upsertPendingChange({
			accountId: userId,
			type: 'phone',
			value: phone,
			codeHash: hash,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		})

		return { ok: true, message: 'OTP sent to new phone.' }
	}

	public async confirmPhoneChange(data: ConfirmPhoneChangeRequest) {
		const { phone, code, userId } = data

		const pending = await this.accountRepository.findPendingChange(
			userId,
			'phone'
		)

		if (!pending)
			throw new RpcException({
				code: status.NOT_FOUND,
				details: 'No pending phone change found for this phone.'
			})

		if (pending.value !== phone)
			throw new RpcException({
				code: status.INVALID_ARGUMENT,
				details: 'Phone missmatch'
			})

		if (pending.expiresAt < new Date())
			throw new RpcException({
				code: status.NOT_FOUND,
				details: 'Code expired.'
			})

		await this.otpService.verifyOtp(pending.value, code, 'phone')

		await this.userRepository.update(userId, {
			phone,
			isPhoneVerified: true
		})

		await this.accountRepository.deletePendingChange(userId, 'phone')

		return { ok: true, message: 'Phone updated successfully.' }
	}
}
