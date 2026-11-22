import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import type {
	CreateUserRequest,
	UsersServiceClient
} from '@teacinema/contracts/gen/ts/users'

@Injectable()
export class UserClientGrpc implements OnModuleInit {
	private userService: UsersServiceClient
	public constructor(
		@Inject('USER_PACKAGE') private readonly client: ClientGrpc
	) {}

	public onModuleInit(): void {
		this.userService =
			this.client.getService<UsersServiceClient>('UserService')
	}

	public create(request: CreateUserRequest) {
		return this.userService.sendOtp(request)
	}
}
