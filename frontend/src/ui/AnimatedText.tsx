import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Text, type TextProps } from '@mantine/core'
import { useReducedMotion } from '@mantine/hooks'

type AnimatedTextVariant = 'value' | 'status'

type AnimatedTextProps = TextProps & {
  children: ReactNode
  valueKey?: string | number
  variant?: AnimatedTextVariant
}

const ANIMATION_BY_VARIANT: Record<AnimatedTextVariant, string> = {
  value: 'bbs2-dynamic-text-enter 560ms cubic-bezier(0.22, 1, 0.36, 1)',
  status: 'bbs2-status-text-enter 620ms cubic-bezier(0.22, 1, 0.36, 1)',
}

const NUMBER_ANIMATION_MIN_MS = 720
const NUMBER_ANIMATION_MAX_MS = 1150
const NUMBER_ANIMATION_DISTANCE_FACTOR = 30

type ParsedNumericText = {
  source: string
  prefix: string
  value: number
  suffix: string
  decimals: number
  decimalSeparator: '.' | ','
}

function parseNumericText(children: ReactNode): ParsedNumericText | null {
  if (typeof children !== 'string' && typeof children !== 'number') {
    return null
  }

  const source = String(children)
  const match = source.match(/^(\s*)([-+]?\d+(?:[.,]\d+)?)(.*)$/)

  if (!match) {
    return null
  }

  const numericText = match[2]
  const value = Number(numericText.replace(',', '.'))

  if (!Number.isFinite(value)) {
    return null
  }

  const decimalSeparator = numericText.includes(',') ? ',' : '.'
  const decimalPart = numericText.match(/[.,](\d+)$/)?.[1]

  return {
    source,
    prefix: match[1],
    value,
    suffix: match[3],
    decimals: decimalPart?.length ?? 0,
    decimalSeparator,
  }
}

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3
}

function getNumberAnimationDuration(start: number, end: number) {
  const distance = Math.abs(end - start)

  return Math.min(
    NUMBER_ANIMATION_MAX_MS,
    Math.max(NUMBER_ANIMATION_MIN_MS, NUMBER_ANIMATION_MIN_MS + distance * NUMBER_ANIMATION_DISTANCE_FACTOR)
  )
}

function formatNumericText(template: ParsedNumericText, value: number) {
  const roundedZeroThreshold = template.decimals === 0 ? 0.5 : 0.5 / 10 ** template.decimals
  const displayValue = Math.abs(value) < roundedZeroThreshold ? 0 : value
  const numberText = displayValue.toFixed(template.decimals)

  return `${template.prefix}${template.decimalSeparator === ',' ? numberText.replace('.', ',') : numberText}${template.suffix}`
}

export function AnimatedText({ children, valueKey, variant = 'value', ...textProps }: AnimatedTextProps) {
  const reduceMotion = useReducedMotion()
  const parsedNumericText = useMemo(() => parseNumericText(children), [children])
  const [displayText, setDisplayText] = useState<ReactNode>(() => parsedNumericText?.source ?? children)
  const displayedNumberRef = useRef<number | null>(parsedNumericText?.value ?? null)
  const frameRef = useRef<number | null>(null)
  const animationKey =
    valueKey ?? (typeof children === 'string' || typeof children === 'number' ? children : variant)
  const spanKey = parsedNumericText ? `${variant}-numeric-value` : String(animationKey)

  useEffect(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }

    if (!parsedNumericText) {
      displayedNumberRef.current = null

      return undefined
    }

    if (reduceMotion) {
      displayedNumberRef.current = parsedNumericText.value

      return undefined
    }

    const numericTemplate = parsedNumericText
    const startValue = displayedNumberRef.current ?? numericTemplate.value
    const endValue = numericTemplate.value

    if (startValue === endValue) {
      displayedNumberRef.current = endValue
      frameRef.current = requestAnimationFrame(() => {
        setDisplayText(numericTemplate.source)
        frameRef.current = null
      })

      return () => {
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current)
          frameRef.current = null
        }
      }
    }

    const duration = getNumberAnimationDuration(startValue, endValue)
    let animationStart: number | null = null

    function tick(timestamp: number) {
      if (animationStart === null) {
        animationStart = timestamp
      }

      const elapsed = timestamp - animationStart
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutCubic(progress)
      const nextValue = startValue + (endValue - startValue) * easedProgress

      displayedNumberRef.current = nextValue
      setDisplayText(formatNumericText(numericTemplate, nextValue))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
        return
      }

      displayedNumberRef.current = endValue
      setDisplayText(numericTemplate.source)
      frameRef.current = null
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [children, parsedNumericText, reduceMotion])

  return (
    <Text {...textProps}>
      <span
        key={spanKey}
        style={{
          display: 'inline-block',
          fontVariantNumeric: parsedNumericText ? 'tabular-nums' : undefined,
          animation: reduceMotion ? undefined : ANIMATION_BY_VARIANT[variant],
          willChange: reduceMotion ? undefined : 'opacity, transform, filter',
        }}
      >
        {parsedNumericText && !reduceMotion ? displayText : children}
      </span>
    </Text>
  )
}
