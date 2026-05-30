import type {
	RefreshRequest,
	SendOtpRequest,
	VerifyOtpRequest
} from '@egorcolgcinema/contracts/gen/auth'
import { PassportService, TokenPayload } from '@egorcolgcinema/passport'
import { status } from '@grpc/grpc-js'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RpcException } from '@nestjs/microservices'
import { Account } from '@prisma/generated/client'

import { OtpService } from '../otp/otp.service'
import { UserRepository } from '../shared'

import { AuthRepository } from './auth.repository'

@Injectable()
export class AuthService {
	private readonly ACCESS_TOKEN_TTL: number
	private readonly REFRESH_TOKEN_TTL: number

	public constructor(
		private readonly configService: ConfigService,
		private readonly authRepository: AuthRepository,
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService,
		private readonly passportService: PassportService
	) {
		this.ACCESS_TOKEN_TTL =
			this.configService.get('ACCESS_TOKEN_TTL') || 900
		this.REFRESH_TOKEN_TTL =
			this.configService.get('REFRESH_TOKEN_TTL') || 2592000
	}

	public async sendOtp(data: SendOtpRequest) {
		const { identifier, type } = data
		let account: Account | null

		if (type === 'phone')
			account = await this.userRepository.findByPhone(identifier)
		else account = await this.userRepository.findByEmail(identifier)

		if (!account) {
			account = await this.authRepository.create({
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
			await this.authRepository.update(account.id, {
				isPhoneVerified: true
			})

		if (type === 'email' && !account.isEmailVerified)
			await this.authRepository.update(account.id, {
				isEmailVerified: true
			})

		return this.generateToken(account.id)
	}

	public refresh(data: RefreshRequest) {
		const { refreshToken } = data

		const result = this.passportService.verify(refreshToken)
		if (!result.valid)
			throw new RpcException({
				code: status.UNAUTHENTICATED,
				details: result.reason
			})

		return this.generateToken(result.userId!)
	}

	private generateToken(userId: string) {
		const payload: TokenPayload = {
			sub: userId
		}

		const accessToken = this.passportService.generate(
			String(payload.sub),
			this.ACCESS_TOKEN_TTL
		)
		const refreshToken = this.passportService.generate(
			String(payload.sub),
			this.REFRESH_TOKEN_TTL
		)

		return {
			accessToken,
			refreshToken
		}
	}
}
