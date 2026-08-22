import { useEffect, useRef } from 'react'

import { Input } from '../../shared/ui'

function normalizeCode(value, length) {
  return String(value ?? '').replace(/\D/g, '').slice(0, length)
}

function getDigits(value, length) {
  const code = normalizeCode(value, length)
  return Array.from({ length }, (_, index) => code[index] ?? '')
}

export function OneTimeCodeInput({
  autoFocus = false,
  disabled = false,
  error = '',
  length = 6,
  onChange,
  value,
}) {
  const refs = useRef([])
  const digits = getDigits(value, length)
  const code = digits.join('')

  useEffect(() => {
    if (autoFocus) {
      refs.current[0]?.focus()
    }
  }, [autoFocus])

  function focusSlot(index) {
    refs.current[Math.max(0, Math.min(index, length - 1))]?.focus()
  }

  function updateDigit(index, nextValue) {
    const normalizedValue = normalizeCode(nextValue, length)

    if (normalizedValue.length > 1) {
      onChange(normalizedValue)
      focusSlot(normalizedValue.length)
      return
    }

    const digit = normalizedValue
    const nextDigits = [...digits]

    nextDigits[index] = digit
    onChange(nextDigits.join('').slice(0, length))

    if (digit) {
      focusSlot(index + 1)
    }
  }

  function handlePaste(event) {
    event.preventDefault()

    const pastedCode = normalizeCode(
      event.clipboardData.getData('text'),
      length,
    )

    if (!pastedCode) {
      return
    }

    onChange(pastedCode)
    focusSlot(pastedCode.length)
  }

  function handleKeyDown(event, index) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault()
      focusSlot(index - 1)
      return
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusSlot(index - 1)
      return
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault()
      focusSlot(index + 1)
    }
  }

  return (
    <div className="grid gap-item">
      <label className="text-label text-text-secondary">Code</label>

      <div className="grid grid-cols-6 gap-item" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <Input
            aria-label={`Code digit ${index + 1}`}
            aria-invalid={error ? 'true' : undefined}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            className="aspect-square h-auto px-0 text-center text-heading tabular-nums"
            disabled={disabled}
            inputMode="numeric"
            key={`code-digit-${index}`}
            name={index === 0 ? 'code' : undefined}
            onChange={(event) => updateDigit(index, event.target.value)}
            onFocus={(event) => event.target.select()}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="text"
            value={digit}
          />
        ))}
      </div>

      <input name="one-time-code" type="hidden" value={code} />

      {error ? (
        <span className="text-label font-normal text-destructive">{error}</span>
      ) : null}
    </div>
  )
}
