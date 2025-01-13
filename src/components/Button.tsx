import React, { useContext } from 'react';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import ConnectButton from 'components/ConnectButton';
import Spinner from 'components/Spinner';
import { AccountWrapperContext } from 'context/Account';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  variant: 'contained' | 'outlined' | 'text';
  stretch?: boolean;
  icon?: IconDefinition;
  pending?: boolean;
  disabledText?: string;
  children?: React.ReactNode;
  needConnect?: boolean;
}

const Button = ({
  text,
  variant,
  stretch = true,
  icon,
  onClick,
  pending,
  disabled: _disabled,
  disabledText,
  children,
  needConnect = false,
  ...props
}: ButtonProps) => {
  const disabled = !!disabledText || _disabled || pending;

  const { connected } = useContext(AccountWrapperContext);
  if (needConnect && !connected) {
    return <ConnectButton />;
  }

  const baseStyles =
    'inline-flex items-center justify-center gap-1 whitespace-nowrap font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 py-2 px-4';
  const variantStyles = {
    contained: 'bg-green-400 text-black hover:bg-green-500 focus:ring-blue-500',
    outlined:
      'border border-blue-600 text-blue-600 hover:bg-blue-100 focus:ring-blue-500',
    text: 'text-blue-600 hover:bg-blue-100 focus:ring-blue-500'
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        stretch && 'w-full',
        disabled && 'cursor-not-allowed opacity-50',
        props.className
      )}
      onClick={onClick}
    >
      {pending && <Spinner size={25} className='mr-2' />}
      {icon && <FontAwesomeIcon icon={icon} className='mr-2' />}
      <span>{disabled ? disabledText || text : text}</span>
      {children}
    </button>
  );
};

export default Button;
