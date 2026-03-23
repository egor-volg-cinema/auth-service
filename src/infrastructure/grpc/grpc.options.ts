import { PROTO_PATH } from '@egorcolgcinema/contracts'
import { GrpcOptions } from '@nestjs/microservices'

export const gRPCPackages = ['auth.v1', 'account.v1']

export const grpcProtoPaths = [PROTO_PATH.AUTH, PROTO_PATH.ACCOUNT]

export const gRPCLoader: NonNullable<GrpcOptions['options']['loader']> = {
	keepCase: false,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true
}
