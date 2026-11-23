'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { env } from '@/lib/env'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function SiteHeader() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const username = session?.user?.name || session?.user?.email?.split('@')[0]

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/')
            router.refresh()
          },
        },
      })
    } catch {
      toast.error('Не удалось выйти из аккаунта.')
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
      <Link aria-label="На главную" className="text-lg font-bold tracking-tight" href="/">
        {env.NEXT_PUBLIC_PAGE_TITLE}
      </Link>
      <div className="flex items-center gap-3">
        {session && (
          <>
            <Link className="text-sm text-muted-foreground hover:text-foreground" href="/vpn">
              VPN
            </Link>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image ?? ''} alt={username ?? 'Аватар'} />
                <AvatarFallback>{username?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{username}</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleSignOut}>
              Выйти
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
