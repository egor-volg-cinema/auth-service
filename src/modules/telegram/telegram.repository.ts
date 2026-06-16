import { PrismaService } from '@infrastructure/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { Account } from '@prisma/client/edge'

@Injectable()
export class TelegramRepository {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findByTelegramId(telegramId: string): Promise<Account | null> {
		return await this.prismaService.account.findFirst({
			where: {
				telegramId
			}
		})
	}
}
