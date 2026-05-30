import { status } from '@grpc/grpc-js'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { createHash } from 'node:crypto'

import { RedisService } from '@/infrastructure/redis/redis.service'

@Injectable()
export class OtpService {
	public constructor(private readonly redisService: RedisService) {}

	public async sendOtp(identifier: string, type: 'phone' | 'email') {
		const { hash, code } = this.generateCode()

		await this.redisService.set(`otp:${type}:${identifier}`, hash, 'EX', 60)

		return { hash, code }
	}

	public async verifyOtp(
		identifier: string,
		code: string,
		type: 'phone' | 'email'
	) {
		const storedHash = await this.redisService.get(
			`otp:${type}:${identifier}`
		)

		if (!storedHash)
			throw new RpcException({
				code: status.NOT_FOUND,
				details: 'Invalid or expired code.'
			})

		const incomingHash = createHash('sha256').update(code).digest('hex')

		if (storedHash !== incomingHash)
			throw new RpcException({
				code: status.NOT_FOUND,
				details: 'Invalid or expired code.'
			})

		await this.redisService.del(`otp:${type}:${identifier}`)
	}

	private generateCode() {
		const code = Math.floor(100000 + Math.random() * 900000).toString()
		const hash = createHash('sha256').update(code).digest('hex')

		return { hash, code }
	}
}
