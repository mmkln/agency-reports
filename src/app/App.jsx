import { RouterProvider } from 'react-router-dom'
import { router } from './routing/router'
import { AuthProvider } from './providers/auth/AuthProvider'
import { ToastProvider } from '../shared/notifications'
import { ThemeProvider } from '../shared/theme'

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
