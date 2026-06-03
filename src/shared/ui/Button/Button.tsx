import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  icon?: ReactNode
  variant?: Variant
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  icon?: ReactNode
  variant?: Exclude<Variant, 'icon'>
}

export function Button({ active, children, className = '', icon, type = 'button', variant = 'secondary', ...props }: ButtonProps) {
  const classes = [styles.button, styles[variant], active ? styles.active : '', className].filter(Boolean).join(' ')

  return (
    <button className={classes} type={type} {...props}>
      {icon}
      {children}
    </button>
  )
}

export function LinkButton({ children, className = '', icon, variant = 'secondary', ...props }: LinkButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ')

  return (
    <a className={classes} {...props}>
      {icon}
      {children}
    </a>
  )
}
