import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { BUTTON_STYLES } from '../../constants/ui';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'riichi';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}: ButtonProps) {
  const getVariantStyles = (variant: ButtonVariant): string => {
    switch (variant) {
      case 'primary': return BUTTON_STYLES.PRIMARY;
      case 'secondary': return BUTTON_STYLES.SECONDARY;
      case 'success': return BUTTON_STYLES.SUCCESS;
      case 'danger': return BUTTON_STYLES.DANGER;
      case 'riichi': return BUTTON_STYLES.RIICHI;
      default: return BUTTON_STYLES.PRIMARY;
    }
  };

  const baseStyles = getVariantStyles(variant);
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button 
      className={`${baseStyles} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}