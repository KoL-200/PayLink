import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('4000'),
    DATABASE_URL: z.string().nonempty('DATABASE_URL is required'),
    JWT_ACCESS_SECRET: z.string().nonempty('JWT_ACCESS_SECRET is required'),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten());
    process.exit(1);
}

export const env = parsed.data;