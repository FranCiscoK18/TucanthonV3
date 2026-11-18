import { LoaderCircle, type LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cx } from '../../utils/cx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'sm';

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconPosition?: 'start' | 'end';
  children: ReactNode;
}

function Content({ icon: Icon, iconPosition = 'start', children, loading }: CommonProps & { loading?: boolean }) {
  const iconNode = loading ? (
    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
  ) : Icon ? (
    <Icon className="size-4 shrink-0" aria-hidden="true" />
  ) : null;
  return (
    <>
      {iconPosition === 'start' && iconNode}
      <span>{children}</span>
      {iconPosition === 'end' && iconNode}
    </>
  );
}

export interface ButtonProps extends CommonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition,
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx('btn', variantClass[variant], size === 'sm' && 'btn-sm', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Content icon={icon} iconPosition={iconPosition} loading={loading}>
        {children}
      </Content>
    </button>
  );
}

export interface ButtonLinkProps extends CommonProps, Omit<LinkProps, 'children'> {}

export function ButtonLink({ variant = 'primary', size = 'md', icon, iconPosition, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={cx('btn', variantClass[variant], size === 'sm' && 'btn-sm', className)} {...rest}>
      <Content icon={icon} iconPosition={iconPosition}>
        {children}
      </Content>
    </Link>
  );
}
