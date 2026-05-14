import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { flushSync } from 'react-dom'
import { DemoRoleSwitcher } from '../components/DemoRoleSwitcher'
import { useAuth } from '../providers/auth/useAuth'
import {
  getDemoRoleOption,
  readDemoRoleKey,
  writeDemoRoleKey,
} from '../providers/session/demoRoleSwitch'

export function AuthLayout({ children }) {
  const { onLogin } = useAuth()
  const navigate = useNavigate()
  const [demoRoleKey, setDemoRoleKey] = useState(() => readDemoRoleKey())

  const handleDemoRoleChange = (roleKey) => {
    const option = getDemoRoleOption(roleKey)
    writeDemoRoleKey(option.key)
    setDemoRoleKey(option.key)
    flushSync(() => {
      onLogin(option.userId)
    })
    navigate(option.homeHref, { replace: true })
  }

  return (
    <>
      {children}
      <DemoRoleSwitcher
        activeRoleKey={demoRoleKey}
        onRoleChange={handleDemoRoleChange}
      />
    </>
  )
}
