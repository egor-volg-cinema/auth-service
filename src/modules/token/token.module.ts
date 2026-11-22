import { getPassportLoader } from '@loaders/passport.loader'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config/dist/config.service'
import { PassportModule } from '@teacinema/passport'

import { TokenService } from './token.service'

@Module({
	imports: [
		PassportModule.registerAsync({
			useFactory: getPassportLoader,
			inject: [ConfigService]
		})
	],
	providers: [TokenService],
	exports: [TokenService]
})
export class TokenModule {}
