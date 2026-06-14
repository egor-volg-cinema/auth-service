import { PrismaService } from '@infrastructure/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import type { Account, PendingContactChange } from '@prisma/generated/client'

@Injectable()
export class AccountRepository {
	public constructor(private readonly prismaService: PrismaService) {}

	public findById(id: string): Promise<Account | null> {
		return this.prismaService.account.findUnique({
			where: {
				id
			}
		})
	}

	public findPendingChange(
		accountId: string,
		type: 'email' | 'phone'
	): Promise<PendingContactChange | null> {
		return this.prismaService.pendingContactChange.findUnique({
			where: {
				accountId_type: {
					accountId,
					type
				}
			}
		})
	}

	public upsertPendingChange(data: {
		accountId: string
		type: 'email' | 'phone'
		value: string
		codeHash: string
		expiresAt: Date
	}): Promise<PendingContactChange> {
		return this.prismaService.pendingContactChange.upsert({
			where: {
				accountId_type: {
					accountId: data.accountId,
					type: data.type
				}
			},
			update: data,
			create: data
		})
	}

	public deletePendingChange(
		accountId: string,
		type: 'email' | 'phone'
	): Promise<PendingContactChange> {
		return this.prismaService.pendingContactChange.delete({
			where: {
				accountId_type: {
					accountId: accountId,
					type
				}
			}
		})
	}
}
