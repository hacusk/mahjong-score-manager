import type { ReactNode } from 'react';
import { CARD_STYLES } from '../../constants/ui';

interface CardProps {
  children: ReactNode;
  className?: string;
  isDealer?: boolean;
}

export function Card({ children, className = '', isDealer = false }: CardProps) {
  const baseStyles = isDealer ? CARD_STYLES.DEALER : CARD_STYLES.BASE;
  
  return (
    <div className={`${baseStyles} ${className}`}>
      {children}
    </div>
  );
}