import { UserModule } from '@infrastructure/clients/users.module'
import { TelegramModule } from '@modules/telegram/telegram.module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validateEnv } from '@validators'

import { MessagingModule } from './infrastructure/messaging/messaging.module'
import { PrismaModule } from './infrastructure/prisma/prisma.module'
import { RedisModule } from './infrastructure/redis/redis.module'
import { AccountModule } from './modules/account/account.module'
import { AuthModule } from './modules/auth/auth.module'
import { OtpModule } from './modules/otp/otp.module'
import { TokenModule } from './modules/token/token.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			validate: validateEnv,
			isGlobal: true,
			envFilePath: [
				`.env.${process.env.NODE_ENV}.local`,
				`.env.${process.env.NODE_ENV}`,
				'.env'
			]
		}),
		PrismaModule,
		RedisModule,
		AuthModule,
		OtpModule,
		AccountModule,
		TelegramModule,
		TokenModule,
		MessagingModule,
		UserModule
	]
})
export class AppModule {}
