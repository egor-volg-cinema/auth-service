import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { PrismaModule } from './infrastructure/prisma/prisma.module'
import { RedisModule } from './infrastructure/redis/redis.module'
import { AuthModule } from './modules/auth/auth.module'
import { OtpModule } from './modules/otp/otp.module'
import { validateEnv } from './validators'
import { AccountModule } from './modules/account/account.module';

@Module({
	imports: [
		ConfigModule.forRoot({ validate: validateEnv, isGlobal: true }),
		PrismaModule,
		RedisModule,
		AuthModule,
		OtpModule,
		AccountModule
	]
})
export class AppModule {}
