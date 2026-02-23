import path from 'node:path';
import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
    schema: path.join(__dirname, 'prisma', 'schema.prisma'),

    // Database URL for CLI commands like db push and migrate
    datasource: {
        url: process.env.DATABASE_URL!,
    },

});
