import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { genericOAuth } from 'better-auth/plugins/generic-oauth'
import { database } from './database'
import { Pool } from 'pg'
import { env } from './env'

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  database: env.DATABASE_URL
    ? new Pool({ connectionString: env.DATABASE_URL })
    : database,
  updateAccountOnSignIn: true,
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000'],
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: 'oauth',
          clientId: env.OPENID_CLIENT_ID,
          clientSecret: env.OPENID_CLIENT_SECRET,
          discoveryUrl: env.OPENID_DISCOVERY_URL,
          pkce: true,
          scopes: ['openid', 'email', 'profile'],
          mapProfileToUser: (profile) => {
            return {
              email: profile.email ?? undefined,
              name: typeof profile.preferred_username === 'string'
                ? profile.preferred_username
                : profile.name,
              image: typeof profile.picture === 'string' ? profile.picture : undefined,
            }
          },
        },
      ],
    }),
    nextCookies(),
  ],
})
