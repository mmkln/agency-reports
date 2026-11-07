import { RouterProvider } from 'react-router-dom'
import { router } from './routing/router'
import { AuthProvider } from './providers/auth/AuthProvider'
import { ToastProvider } from '../shared/notifications'
import { ThemeProvider } from '../shared/theme'
import { BrandProvider } from '../shared/branding'
import { siteDefinition } from './config/siteDefinition'
import { SiteDocumentMetadata } from './providers/site/SiteDocumentMetadata'

function App() {
  return (
    <BrandProvider brand={siteDefinition.brand}>
      <SiteDocumentMetadata site={siteDefinition} />
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrandProvider>
  )
}

export default App
