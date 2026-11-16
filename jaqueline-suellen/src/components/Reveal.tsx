import type { ElementType, ReactNode } from 'react';
import { useReveal } from '../hooks/useReveal';

export function Reveal({ as: Tag = 'div', className = '', children }: { as?: ElementType; className?: string; children: ReactNode }) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
