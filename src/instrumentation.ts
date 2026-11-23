export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.SKIP_ENV_VALIDATION) return
  const [{ auth }, { getMigrations }] = await Promise.all([
    import('./lib/auth'),
    import('better-auth/db/migration'),
  ])
  const { runMigrations } = await getMigrations(auth.options)
  await runMigrations()
}
