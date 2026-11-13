export function SectionHeading({ eyebrow, title, subtitle, id }: { eyebrow?: string; title: string; subtitle?: string; id?: string }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="title-display mt-2 text-3xl sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-base text-ash sm:text-lg">{subtitle}</p>}
    </div>
  );
}
