import { z } from 'zod'

const schema = z.object({
  VITE_API_BASE_URL: z.string().default('/api'),
  VITE_APP_NAME: z.string().default('App Template'),
  VITE_ENABLE_MOCK: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
})

const parsed = schema.safeParse(import.meta.env)

if (!parsed.success) {
  // Fail loudly at boot instead of producing confusing runtime errors later.
  throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`)
}

export const env = {
  apiBaseUrl: parsed.data.VITE_API_BASE_URL,
  appName: parsed.data.VITE_APP_NAME,
  enableMock: parsed.data.VITE_ENABLE_MOCK,
}
