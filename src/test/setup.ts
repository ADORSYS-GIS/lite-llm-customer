import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(__dirname, "../../.env.test") });

const env = process.env as Record<string, string | undefined>;

env.NODE_ENV ??= "test";
env.LITELLM_PROXY_URL ??= "http://localhost:4000";
env.LITELLM_API_KEY ??= "test-api-key";
env.NEXTAUTH_SECRET ??= "test-secret";
env.ADMIN_EMAIL ??= "admin@example.com";
env.ADMIN_PASSWORD ??= "password";
