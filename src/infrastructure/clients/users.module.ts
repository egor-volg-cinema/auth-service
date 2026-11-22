import { grpcLoader } from '@infrastructure/grpc/grpc.options'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { PROTO_PATHS } from '@teacinema/contracts'

import { UserClientGrpc } from './users.grpc'

@Module({
	imports: [
		ClientsModule.registerAsync([
			{
				name: 'USER_PACKAGE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: 'users.v1',
						protoPath: PROTO_PATHS.USERS,
						url: configService.getOrThrow<string>(
							'USERS_GRPC_URL',
							{ infer: true }
						),
						loader: grpcLoader
					}
				}),
				inject: [ConfigService]
			}
		])
	],

	providers: [UserClientGrpc],
	exports: [UserClientGrpc]
})
export class UserModule {}
