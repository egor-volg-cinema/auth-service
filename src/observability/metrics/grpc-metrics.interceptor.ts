import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor
} from '@nestjs/common'
import { InjectMetric } from '@willsoto/nestjs-prometheus'
import type { Counter, Histogram } from 'prom-client'
import { type Observable, tap } from 'rxjs'

@Injectable()
export class gRPCMetricsInterceptor implements NestInterceptor {
	private readonly SERVICE_NAME: string

	public constructor(
		@InjectMetric('grpc_request_duration_seconds')
		private readonly histogram: Histogram<string>,
		@InjectMetric('grpc_requests_total')
		private readonly counter: Counter<string>
	) {
		this.SERVICE_NAME = 'auth'
	}

	public intercept(
		context: ExecutionContext,
		next: CallHandler<any>
	): Observable<any> {
		const handlerName = context.getHandler().name

		const endTimer = this.histogram.startTimer({
			service: this.SERVICE_NAME,
			handler: handlerName
		})

		return next.handle().pipe(
			tap({
				next: () => {
					this.counter.inc({
						service: this.SERVICE_NAME,
						method: handlerName,
						status: 'OK'
					})
					endTimer()
				},

				error: () => {
					this.counter.inc({
						service: this.SERVICE_NAME,
						method: handlerName,
						status: 'ERROR'
					})
					endTimer()
				}
			})
		)
	}
}
