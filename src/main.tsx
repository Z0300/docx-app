import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { env } from '@/config/env'
import { App } from '@/app/App'
import { useThemeStore } from '@/stores/themeStore'
import './index.css'

async function bootstrap() {
  if (env.enableMock) {
    // Dynamic import keeps the mock out of production bundles when the flag is off.
    const { installMockApi } = await import('@/mocks/mockApi')
    installMockApi()
  }

  document.title = env.appName
  // Apply the persisted (or OS-preferred) theme before first paint.
  document.documentElement.setAttribute('data-theme', useThemeStore.getState().theme)

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
