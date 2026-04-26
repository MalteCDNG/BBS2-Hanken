import { type ReactNode } from 'react'
import { Text, type TextProps } from '@mantine/core'
import { useReducedMotion } from '@mantine/hooks'

type AnimatedTextVariant = 'value' | 'status'

type AnimatedTextProps = TextProps & {
  children: ReactNode
  valueKey?: string | number
  variant?: AnimatedTextVariant
}

const ANIMATION_BY_VARIANT: Record<AnimatedTextVariant, string> = {
  value: 'bbs2-dynamic-text-enter 360ms cubic-bezier(0.16, 1, 0.3, 1)',
  status: 'bbs2-status-text-enter 420ms cubic-bezier(0.16, 1, 0.3, 1)',
}

export function AnimatedText({ children, valueKey, variant = 'value', ...textProps }: AnimatedTextProps) {
  const reduceMotion = useReducedMotion()
  const animationKey =
    valueKey ?? (typeof children === 'string' || typeof children === 'number' ? children : variant)

  return (
    <Text {...textProps}>
      <span
        key={String(animationKey)}
        style={{
          display: 'inline-block',
          animation: reduceMotion ? undefined : ANIMATION_BY_VARIANT[variant],
          willChange: reduceMotion ? undefined : 'opacity, transform, filter',
        }}
      >
        {children}
      </span>
    </Text>
  )
}
