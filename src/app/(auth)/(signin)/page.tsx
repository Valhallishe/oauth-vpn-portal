import { env } from '@/lib/env'
import { getSession } from '@/lib/session'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { OauthSignInButton } from './oauth-signin-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_PAGE_TITLE,
}

export default async function SignInViewPage() {
  const session = await getSession()
  if (session) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col justify-center gap-6 px-6 py-12">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={session.user.image ?? ''} alt={session.user.name ?? 'Аватар'} />
            <AvatarFallback>{session.user.name?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-semibold">Ваш аккаунт</h1>
            <p className="mt-1 text-muted-foreground">Данные профиля из Authentik</p>
          </div>
        </div>
        <dl className="space-y-4 rounded-xl border p-6">
          <div>
            <dt className="text-sm text-muted-foreground">Имя пользователя</dt>
            <dd>{session.user.name || session.user.email.split('@')[0]}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Почта</dt>
            <dd>{session.user.email}</dd>
          </div>
        </dl>
        <Link className="rounded-lg bg-primary px-5 py-3 text-center text-primary-foreground" href="/vpn">
          Моя VPN-подписка
        </Link>
      </main>
    )
  }
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex-col items-center justify-center md:grid lg:max-w-none">
      <div className="flex min-h-[calc(100vh-4rem)] items-center p-4 lg:p-8">
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
