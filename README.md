# Valhallishe Account / VPN portal

Fork of [OAuth VPN Portal](https://github.com/kirill-dev-pro/oauth-vpn-portal), adapted for Authentik and Remnawave 3.x. The home page displays the signed-in account, and `/vpn` displays its subscription. Sign-in uses OIDC with PKCE.

New users who open `/vpn` receive an unlimited subscription in `Default-Squad` (expiry 2099). The portal does not modify existing limits. A random reserved username makes creation retryable; existing Remnawave accounts are never matched automatically by email or username.

## Existing subscriptions

An administrator must link an existing subscription before that user first opens `/vpn`. The user should first sign in at `/` so the portal has a local account. In the running container execute:

```sh
node scripts/link-user.cjs USER_EMAIL REMNAWAVE_USER_ID
```

The command refuses to overwrite an existing link. Keep the SQLite database and its journal on persistent storage; back it up consistently. If a user has already opened `/vpn`, review the generated account and link manually rather than overwriting the binding blindly.

## Deployment

The Valhallishe infrastructure repository provides the Nix/systemd and rootless Podman configuration. It reads the panel token from `/home/krozzzis/.config/valhallishe-vpn/remnawave-token` on nixarchserver; never commit this file. Set `DATABASE_PATH` to the persistent SQLite path. `npm ci --legacy-peer-deps` installs the locked dependencies; `npm run db:migrate` migrates the auth database. The standalone server applies its auth database migration at startup. The runtime image contains only Node.js, the traced application and its runtime dependencies.

The Authentik application is `vpn-portal` and its access group is `vpn-portal-access`; the `default-citizen` role also grants access. The public OIDC callback is `/api/auth/callback/oauth`.

---

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkirill-dev-pro%2Foauth-vpn-portal)

# OAuth VPN Portal

A Next.js application that provides OAuth-based authentication for Marzban and Remanwave VPN panel. This portal automatically creates new VPN subscriptions for authenticated users through OAuth. After loging in users will see your subscription template from your marzban server.

NOTE: due to limitations of @remnawave/backend-contract and [Typescript SDK](https://remna.st/docs/sdk/typescript-sdk) this version of Portal may not work with some versions of remnavawe panel. Current version is confirmed to work with version 2.1.3 of remanvawe 

## Features

- OAuth-based authentication using BetterAuth
- Automatic VPN subscription creation for authenticated users
- Modern UI built with Next.js and Tailwind CSS
- PostgreSQL database integration for user management
- Secure configuration management
- TypeScript support

## Screenshots

### Login Page
![Login Page](public/screenshots/login_page.png)

### Main Page with Marzban subscription page
![Main Page](public/screenshots/main_page.png)

### Main Page with Remanwave built in UI
![Main Page](public/screenshots/main_page_remnawave.png)

## Prerequisites

- Node.js (Latest LTS version recommended)
- PostgreSQL database 
- Marzban VPN server instance

## Installation

1. Clone the repository:

2. Install dependencies:
```bash
bun i
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required environment variables:
     - `BETTER_AUTH_SECRET`: Secret key for auth. It is recomenended to generate new random string with `openssl rand -hex 32`
     - `DATABASE_URL`: PostgreSQL connection string
     - `OPENID_CLIENT_ID`: Your OAuth client ID
     - `OPENID_CLIENT_SECRET`: Your OAuth client secret
     - `OPENID_DISCOVERY_URL`: Well-known OpenID configuration URL
     - `MARZBAN_API_URL`: API URL of your Marzban VPN server. Usually the same as `NEXT_PUBLIC_MARZBAN_INSTANCE_URL`
     - `MARZBAN_USERNAME`: Marzban admin username
     - `MARZBAN_PASSWORD`: Marzban admin password
     - `NEXT_PUBLIC_LOGIN_BUTTON_TEXT`: Custom text for the login button
     - `NEXT_PUBLIC_MARZBAN_INSTANCE_URL`: Optional. Public URL of your Marzban instance. Without trailing slash.
     - `NEXT_PUBLIC_PAGE_TITLE`: Title of the portal page

4. Migrate the database
```bash
bunx @better-auth/cli migrate
```

## Database

Optional, by default app will save authenticated users in `users-db.sqlite` db on the disk. You can have voulume for this file.

If you want you can have a PostgreSQL database running somewhere to store logined users. You can run free postgres on https://neon.tech/, it will be enought.

## Development

Start the development server:

```bash
bun dev
```

The application will be available at `http://localhost:3000`.

## Building for Production

1. Build the application:
```bash
bun run build
```

2. Start the production server:
```bash
bun start
```

## Docker

```
docker run demostar/oauth-vpn-portal
```

## Vercel

Easiest deployment methed is just pushing it to vercel.com. You can clone this repo and use `vercel deploy` cli or you can use this button bellow to fork repo and create vercel integration

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkirill-dev-pro%2Foauth-vpn-portal)

You can create free database with Neon for app. It will provide DATABASE_URL env var automatically in the vercel.

You will need to specify environment variables. You can copy this snippet to code editor, fill with actual data, and then copy and paste to vercel all together

```
NEXT_PUBLIC_APP_URL=
BETTER_AUTH_SECRET=
# OAuth provider details
OPENID_CLIENT_ID=
OPENID_CLIENT_SECRET=
OPENID_DISCOVERY_URL=
PANEL_API_URL=
PANEL_TYPE=remnawave # OR marzban
# Optional traffic limit for each new user. From 0.001 to 1000000
PANEL_USER_TRAFFIC_LIMIT_GB=100
# Remanwave API
REMNAWAVE_API_KEY=
# OR Marzban API
MARZBAN_USERNAME=
MARZBAN_PASSWORD=
# UI
NEXT_PUBLIC_LOGIN_BUTTON_TEXT=
NEXT_PUBLIC_PAGE_TITLE=
```

The easiest way to create your OAuth provider and manage users — [klaud.me](https://klaud.me). You can create a free group, invite people and those people will be authorized to access this app. You will need to create new OAuth app integration for your group and copy `OPENID_CLIENT_ID`, `OPENID_CLIENT_SECRET` and `OPENID_DISCOVERY_URL` from there.

## License

This project is licensed under the MIT License - see the LICENSE file for details.