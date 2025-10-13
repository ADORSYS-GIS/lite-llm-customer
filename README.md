# LiteLLM Customer Management

A [T3 Stack](https://create.t3.gg/) Next.js application for managing LiteLLM customers and budgets. This application provides a web-based admin interface to interact with LiteLLM proxy services.

## Features

- 🔐 **Secure Authentication** - NextAuth.js-based admin authentication
- 👥 **Customer Management** - View and manage LiteLLM customers
- 💰 **Budget Management** - Create, assign, and update budgets
- 📊 **Usage Tracking** - Monitor customer spending and limits
- 🔌 **LiteLLM Integration** - Direct integration with LiteLLM proxy API
- 🐳 **Docker Ready** - Full Docker and Docker Compose support

## Quick Start

### Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/lite-llm-customer.git
cd lite-llm-customer

# Copy environment template
cp .env.docker.example .env

# Generate NextAuth secret
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env

# Copy docker-compose template
cp docker-compose.example.yml docker-compose.yml

# Start all services
docker compose up -d

# Access the application at http://localhost:3000
```

For detailed Docker deployment instructions, see [Docker Deployment Guide](docs/4-docker-deployment.md).

### Local Development

```bash
# Install dependencies
yarn install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
yarn dev

# Open http://localhost:3000
```

## Authentication

This project uses NextAuth.js for authentication. In a development environment, you can log in with the following credentials:

-   **Email**: `admin@example.com`
-   **Password**: `password`

These credentials can be configured in the `.env` file.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## Server API

### Budget Router

All admin-only interactions with LiteLLM budgets and customers are exposed via the tRPC router under `budget.*` procedures.

- `budget.listCustomers` – lists customers by calling the LiteLLM customer list endpoint.
- `budget.getCustomerInfo` – fetches customer details given `{ end_user_id }`.
- `budget.createBudget` – creates a budget with `{ budget_id, max_budget, budget_duration? }`.
- `budget.assignBudget` – assigns an existing budget via `{ user_id, budget_id }`.
- `budget.listBudgets` – lists budgets from LiteLLM.
- `budget.updateBudget` – updates a budget's `max_budget` via `{ budget_id, max_budget }`.

Every procedure:

- Uses Zod validation for its inputs and, where relevant, outputs.
- Requires an authenticated admin session enforced by the `adminProcedure` middleware in `src/server/api/trpc.ts`.
- Returns normalized, user-safe error messages using `TRPCError`.

Refer to `src/server/api/routers/budget.ts` for implementation details.

## Environment Variables

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `LITELLM_PROXY_URL` | LiteLLM proxy endpoint | `http://litellm:4000` |
| `LITELLM_API_KEY` | LiteLLM master key | `sk-1234` |
| `NEXTAUTH_SECRET` | NextAuth session secret | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `ADMIN_EMAIL` | Admin login email | `admin@example.com` |
| `ADMIN_PASSWORD` | Admin login password | `password` |

See `.env.example` or `.env.docker.example` for complete configuration templates.

## Available Scripts

```bash
# Development
yarn dev              # Start development server with Turbo
yarn build            # Build for production
yarn start            # Start production server
yarn preview          # Build and start production server

# Code Quality
yarn check            # Run Biome linter
yarn check:write      # Run Biome linter and fix issues
yarn typecheck        # Run TypeScript type checking

# Testing
yarn test             # Run tests with Vitest
```

## Docker Deployment

### Using Docker Compose (Full Stack)

The easiest way to deploy is using Docker Compose, which includes:
- Next.js application
- LiteLLM proxy
- PostgreSQL database
- Ollama (optional)

```bash
# Copy templates
cp docker-compose.example.yml docker-compose.yml
cp .env.docker.example .env

# Configure environment
# Edit .env with your settings

# Start services
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

### Using Docker Only

Build and run just the Next.js application:

```bash
# Build image
docker build -t lite-llm-customer .

# Run container
docker run -d \
  -p 3000:3000 \
  -e LITELLM_PROXY_URL=http://your-litellm-host:4000 \
  -e LITELLM_API_KEY=your-api-key \
  -e NEXTAUTH_SECRET=your-secret \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e ADMIN_EMAIL=admin@example.com \
  -e ADMIN_PASSWORD=password \
  --name litellm-customer-ui \
  lite-llm-customer
```

### Docker Hub

Pre-built images are available on Docker Hub:

```bash
docker pull your-dockerhub-username/lite-llm-customer:latest
```

For comprehensive Docker deployment instructions, troubleshooting, and production best practices, see the [Docker Deployment Guide](docs/4-docker-deployment.md).

## Documentation

- [LiteLLM + Ollama Docker Setup](docs/1-litellm-ollama-docker-guide.md)
- [Custom Pricing Configuration](docs/2-custom-pricing-litellm-ollama-docker.md)
- [LiteLLM Pricing Management](docs/3-litellm-pricing-management.md)
- [Docker Deployment Guide](docs/4-docker-deployment.md)

## Architecture

```
┌─────────────────┐         ┌──────────────────────────┐
│   Next.js App   │────────▶│   LiteLLM Proxy          │
│   (port 3000)   │         │   (port 4000)            │
│                 │         │                          │
│ - Admin UI      │         │ - Customer Management    │
│ - NextAuth      │         │ - Budget Management      │
│ - tRPC API      │         │ - Usage Tracking         │
└─────────────────┘         └──────────────────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │   PostgreSQL     │
                            │   (port 5432)    │
                            └──────────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │     Ollama       │
                            │   (port 11434)   │
                            └──────────────────┘
```

## Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org) (Pages Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Authentication**: [NextAuth.js](https://next-auth.js.org)
- **API**: [tRPC](https://trpc.io)
- **Validation**: [Zod](https://zod.dev)
- **HTTP Client**: [Axios](https://axios-http.com)
- **Testing**: [Vitest](https://vitest.dev)
- **Code Quality**: [Biome](https://biomejs.dev)

## How do I deploy this?

### Deployment Options

1. **Docker** (Recommended) - See [Docker Deployment Guide](docs/4-docker-deployment.md)
2. **Vercel** - Follow [Vercel deployment guide](https://create.t3.gg/en/deployment/vercel)
3. **Netlify** - Follow [Netlify deployment guide](https://create.t3.gg/en/deployment/netlify)
4. **Self-hosted** - Build and deploy on any Node.js hosting platform

### Production Checklist

- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Change default `ADMIN_PASSWORD`
- [ ] Configure `NEXTAUTH_URL` to production domain
- [ ] Set up HTTPS/SSL
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Review security settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)

## Support

For issues and questions:
- Create an issue on GitHub
- Check the [documentation](docs/)
- Review existing issues and discussions
