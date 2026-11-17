import { PassportOptions } from '@teacinema/passport'
import { ConfigService } from '@nestjs/config'

export function getPassportLoader(
	configService: ConfigService
): PassportOptions {
	return {
		secretKey: configService.get('PASSPORT_SECRET_KEY')!
	}
}
