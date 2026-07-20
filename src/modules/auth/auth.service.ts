import type {
	RefreshRequest,
	SendOtpRequest,
	VerifyOtpRequest
} from '@egorcolgcinema/contracts/gen/auth'
import { status } from '@grpc/grpc-js'
import { TokenService } from '@modules/token/token.service'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Account } from '@prisma/generated/client'

import { OtpService } from '../otp/otp.service'
import { UserRepository } from '../shared'

@Injectable()
export class AuthService {
	public constructor(
		private readonly tokenService: TokenService, 
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService
	) {}

	public async sendOtp(data: SendOtpRequest) {
		const { identifier, type } = data
		let account: Account | null

		if (type === 'phone')
			account = await this.userRepository.findByPhone(identifier)
		else account = await this.userRepository.findByEmail(identifier)

		if (!account) {
			account = await this.userRepository.create({
				email: type === 'email' ? identifier : null,
				phone: type === 'phone' ? identifier : null
			})
		}

		const code = await this.otpService.sendOtp(
			identifier,
			type as 'phone' | 'email'
		)

		console.debug('CODE', code)

		return { ok: true }
	}

	public async verifyOtp(data: VerifyOtpRequest) {
		const { identifier, type, code } = data

		await this.otpService.verifyOtp(
			identifier,
			code,
			type as 'phone' | 'email'
		)

		let account: Account | null

		if (type === 'phone')
			account = await this.userRepository.findByPhone(identifier)
		else account = await this.userRepository.findByEmail(identifier)

		if (!account)
			throw new RpcException({
				code: status.NOT_FOUND,
				details: 'Account not found.'
			})

		if (type === 'phone' && !account.isPhoneVerified)
			await this.userRepository.update(account.id, {
				isPhoneVerified: true
			})

		if (type === 'email' && !account.isEmailVerified)
			await this.userRepository.update(account.id, {
				isEmailVerified: true
			})

		return this.tokenService.generateToken(account.id)
	}

	public refresh(data: RefreshRequest) {
		const { refreshToken } = data

		const result = this.tokenService.verifyToken(refreshToken)
		if (!result.valid)
			throw new RpcException({
				code: status.UNAUTHENTICATED,
				details: result.reason
			})

		return this.tokenService.generateToken(result.userId!)
	}
}
