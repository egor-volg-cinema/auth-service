import { z } from 'zod'

export const envSchema = z.object({
	POSTGRES_URI: z
		.string()
		.startsWith('postgres://', 'Must be a valid PostgreSQL URI'),
	POSTGRES_PASSWORD: z.string().min(1),
	POSTGRES_USER: z.string().min(1),
	POSTGRES_HOST: z.string().min(1),
	POSTGRES_PORT: z.coerce.number().min(1).max(65535),
	POSTGRES_DATABASE: z.string().min(1),

	REDIS_USER: z.string().min(1),
	REDIS_PASSWORD: z.string().min(1),
	REDIS_HOST: z.string().min(1),
	REDIS_PORT: z.coerce.number().min(1).max(65535),

	RMQ_URL: z.string().startsWith('amqp://', 'Must be a valid RMQ URL'),

	GRPC_HOST: z.string().min(1),
	GRPC_PORT: z.coerce.number().min(1).max(65535),

	PASSPORT_SECRET_KEY: z.string().min(1),
	PASSPORT_ACCESS_TTL: z.string().min(1),
	PASSPORT_REFRESH_TTL: z.string().min(1),

	TELEGRAM_BOT_ID: z.string().min(1),
	TELEGRAM_BOT_TOKEN: z.string().min(1),
	TELEGRAM_BOT_USERNAME: z.string().min(1),
	TELEGRAM_REDIRECT_ORIGIN: z.string().min(1),

	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development')
})

export type Env = z.infer<typeof envSchema>
