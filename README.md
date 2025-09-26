# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

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
- `budget.createBudget` – creates a budget with `{ user_id, budget_id }`.
- `budget.assignBudget` – assigns an existing budget via `{ user_id, budget_id }`.

Every procedure:

- Uses Zod validation for its inputs and, where relevant, outputs.
- Requires an authenticated admin session enforced by the `adminProcedure` middleware in `src/server/api/trpc.ts`.
- Returns normalized, user-safe error messages using `TRPCError`.

Refer to `src/server/api/routers/budget.ts` and `src/server/api/routers/budget.test.ts` for implementation and tests that mock the LiteLLM wrapper.

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
