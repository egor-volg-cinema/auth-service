import { PrismaService } from '@infrastructure/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { Account } from '@prisma/generated/client'

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
