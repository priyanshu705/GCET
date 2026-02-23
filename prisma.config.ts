import path from 'node:path';
import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
    earlyAccess: true,
    schema: path.join(__dirname, 'prisma', 'schema.prisma'),

    // Database URL for CLI commands like db push and migrate
    datasource: {
        url: process.env.DATABASE_URL!,
    },

    migrate: {
        adapter: async () => {
            const { PrismaPg } = await import('@prisma/adapter-pg');
            const { Pool } = await import('pg');

            const pool = new Pool({
                connectionString: process.env.DATABASE_URL,
            });

            return new PrismaPg(pool);
        },
    },
});
