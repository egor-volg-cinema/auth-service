import { TokenService } from '@modules/token/token.service'
import { Module } from '@nestjs/common'

import { OtpService } from '../otp/otp.service'
import { UserRepository } from '../shared'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
	controllers: [AuthController],
	providers: [UserRepository, AuthService, OtpService, TokenService]
})
export class AuthModule {}
