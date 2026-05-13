import { useState } from 'react'
import { DemoRoleSwitcher } from '../components/DemoRoleSwitcher'
import {
  getDemoRoleOption,
  readDemoRoleKey,
  writeDemoRoleKey,
} from '../providers/session/demoRoleSwitch'

export function AuthLayout({ children }) {
  const [demoRoleKey, setDemoRoleKey] = useState(() => readDemoRoleKey())

  const handleDemoRoleChange = (roleKey) => {
    const option = getDemoRoleOption(roleKey)
    writeDemoRoleKey(option.key)
    setDemoRoleKey(option.key)
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
