import { env } from '@/lib/env'
import { getSession } from '@/lib/session'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { OauthSignInButton } from './oauth-signin-button'

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_PAGE_TITLE,
}

export default async function SignInViewPage() {
  const session = await getSession()
  if (session) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-12">
        <div>
          <p className="text-sm text-muted-foreground">Valhallishe</p>
          <h1 className="mt-2 text-3xl font-semibold">Ваш аккаунт</h1>
          <p className="mt-2 text-muted-foreground">Данные профиля из Authentik</p>
        </div>
        <dl className="space-y-4 rounded-xl border p-6">
          <div><dt className="text-sm text-muted-foreground">Имя</dt><dd>{session.user.name}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Почта</dt><dd>{session.user.email}</dd></div>
        </dl>
        <Link className="rounded-lg bg-primary px-5 py-3 text-center text-primary-foreground" href="/vpn">Моя VPN-подписка</Link>
      </main>
    )
  }
  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none ">
      <div className="flex h-full items-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{env.NEXT_PUBLIC_PAGE_TITLE}</h1>
          </div>
          <Suspense fallback={<div className="w-full h-10 bg-gray-200" />}>
            <OauthSignInButton />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
