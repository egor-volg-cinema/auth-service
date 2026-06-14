import { PassportModule } from '@egorcolgcinema/passport'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { getPassportLoader } from '@/loaders'

import { OtpService } from '../otp/otp.service'
import { UserRepository } from '../shared'

import { AuthController } from './auth.controller'
import { AuthRepository } from './auth.repository'
import { AuthService } from './auth.service'

@Module({
	imports: [
		PassportModule.registerAsync({
			useFactory: getPassportLoader,
			inject: [ConfigService]
		})
	],
	controllers: [AuthController],
	providers: [AuthService, AuthRepository, OtpService, UserRepository]
})
export class AuthModule {}
