'use client';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ variant = 'dark', size = 'md' }: LogoProps) {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-3xl' };
  const iconSizes = { sm: 20, md: 26, lg: 40 };
  const iconSize = iconSizes[size];

  const primary = variant === 'light' ? '#ffffff' : '#2C4577';
  const accent = '#C4862B';
  const textColor = variant === 'light' ? 'text-white' : 'text-brand-500';
  const subColor = variant === 'light' ? 'text-white/60' : 'text-brand-300';

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon: abstract fiber spool */}
      <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer ring */}
        <circle cx="20" cy="20" r="18" stroke={primary} strokeWidth="2" fill="none" />
        {/* Inner hub */}
        <circle cx="20" cy="20" r="5" fill={accent} />
        {/* Fiber spokes */}
        <path d="M20 7 Q26 14 20 20 Q14 14 20 7" fill={primary} opacity="0.7" />
        <path d="M33 20 Q26 26 20 20 Q26 14 33 20" fill={primary} opacity="0.5" />
        <path d="M20 33 Q14 26 20 20 Q26 26 20 33" fill={primary} opacity="0.7" />
        <path d="M7 20 Q14 14 20 20 Q14 26 7 20" fill={primary} opacity="0.5" />
        {/* Accent arc */}
        <path d="M20 2 A18 18 0 0 1 38 20" stroke={accent} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className={`font-display font-bold tracking-tight ${sizes[size]} ${textColor}`}>
          Belfast
        </span>
        <span className={`font-sans font-semibold tracking-[0.15em] uppercase text-xs ${subColor}`}>
          Mini Mills
        </span>
      </div>
    </div>
  );
}
