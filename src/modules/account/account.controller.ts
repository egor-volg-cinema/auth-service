import type {
	GetAccountRequest,
	GetAccountResponse
} from '@egorcolgcinema/contracts/gen/account'
import { Controller } from '@nestjs/common'

import { AccountService } from './account.service'

@Controller()
export class AccountController {
	public constructor(private readonly accountService: AccountService) {}

	public async getAccount(
		data: GetAccountRequest
	): Promise<GetAccountResponse> {
		return await this.accountService.getAccount(data)
	}
}
