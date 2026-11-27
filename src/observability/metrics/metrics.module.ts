import { Global, Module } from '@nestjs/common'
import {
	makeCounterProvider,
	makeHistogramProvider,
	PrometheusModule
} from '@willsoto/nestjs-prometheus'

import { gRPCMetricsInterceptor } from './grpc-metrics.interceptor'

@Global()
@Module({
	imports: [
		PrometheusModule.register({
			path: '/metrics',
			defaultMetrics: { enabled: true }
		})
	],
	providers: [
		makeHistogramProvider({
			name: 'grpc_request_duration_seconds',
			help: 'gRPC request duration in seconds',
			labelNames: ['service', 'method']
		}),
		makeCounterProvider({
			name: 'grpc_requests_total',
			help: 'Total number of gRPC requests',
			labelNames: ['service', 'method', 'status_code']
		}),
		gRPCMetricsInterceptor,
		{
			provide: 'APP_INTERCEPTOR',
			useClass: gRPCMetricsInterceptor
		}
	]
})
export class MetricsModule {}
