import { TokenPayload } from '@teacinema/passport'
import { PassportService } from '@teacinema/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config/dist/config.service'

@Injectable()
export class TokenService {
	private readonly ACCESS_TOKEN_TTL: number
	private readonly REFRESH_TOKEN_TTL: number

	public constructor(
		private readonly configService: ConfigService,
		private readonly passportService: PassportService
	) {
		this.ACCESS_TOKEN_TTL =
			this.configService.get('ACCESS_TOKEN_TTL') || 900
		this.REFRESH_TOKEN_TTL =
			this.configService.get('REFRESH_TOKEN_TTL') || 2592000
	}

	public generateToken(userId: string) {
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

	public verifyToken(token: string) {
		return this.passportService.verify(token)
	}
}
