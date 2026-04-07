import { GetAccountRequest, Role } from '@egorcolgcinema/contracts/gen/account'
import { status } from '@grpc/grpc-js'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

import { convertEnum } from '@/enums'

import { AccountRepository } from './account.repository'

@Injectable()
export class AccountService {
	public constructor(private readonly accountRepository: AccountRepository) {}
	public async getAccount(data: GetAccountRequest) {
		const { id } = data

		const account = await this.accountRepository.findById(id)
		if (!account)
			throw new RpcException({
				code: status.NOT_FOUND,
				details: 'Account not found.'
			})

		return {
			id: account.id,
			phone: account.phone ? account.phone : '',
			email: account.email ? account.email : '',
			isPhoneVerified: account.isPhoneVerified,
			isEmailVerified: account.isEmailVerified,
			role: convertEnum(Role, account.role)
		}
	}
}
