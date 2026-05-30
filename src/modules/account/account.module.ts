import { Module } from '@nestjs/common'

import { OtpService } from '../otp/otp.service'
import { UserRepository } from '../shared'

import { AccountController } from './account.controller'
import { AccountRepository } from './account.repository'
import { AccountService } from './account.service'

@Module({
	controllers: [AccountController],
	providers: [AccountService, AccountRepository, OtpService, UserRepository]
})
export class AccountModule {}
