import { ConfigService } from '@nestjs/config'
import { PassportOptions } from '@teacinema/passport'

export function getPassportLoader(
	configService: ConfigService
): PassportOptions {
	return {
		secretKey: configService.get('PASSPORT_SECRET_KEY')!
	}
}
