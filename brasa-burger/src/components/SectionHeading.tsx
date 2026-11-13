import { BrushStroke } from './icons';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tone?: 'light' | 'dark';
  align?: 'left' | 'center';
  brush?: string;
  id?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, tone = 'light', align = 'center', brush = 'text-mustard', id }: Props) {
  const center = align === 'center';
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} max-w-3xl`}>
      {eyebrow && <p className={`eyebrow mb-3 ${tone === 'light' ? 'text-tomato' : 'text-mustard'}`}>{eyebrow}</p>}
      <h2 id={id} className={`section-title ${tone === 'light' ? 'text-wine' : 'text-white'}`}>{title}</h2>
      <BrushStroke className={`mt-4 h-3 w-40 ${brush} ${center ? 'mx-auto' : ''}`} />
      {subtitle && (
        <p className={`mt-5 text-lg ${tone === 'light' ? 'text-char/75' : 'text-white/80'}`}>{subtitle}</p>
      )}
    </div>
  );
}
