import React from 'react';

interface BrandLogoProps {
  variant?: 'light' | 'dark' | 'white' | 'colored';
  showTagline?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'vertical' | 'mark-only';
}

/**
 * High-precision vector rendering of the official Audrin Fire Engineers Logo:
 * - Stylized Navy Blue 'A' glyph
 * - Integrated smoke/fire detector chamber in the arch with vents and crimson LED sensor
 * - Radiating crimson acoustic/radio waves on left and right of the apex
 * - Navy bold "AUDRIN" wordmark
 * - Crimson spaced "F I R E   E N G I N E E R S" uppercase sub-title
 */
export const AudrinLogoMark: React.FC<{
  className?: string;
  size?: number;
  isLight?: boolean;
}> = ({ className = '', size = 48, isLight = false }) => {
  const navyColor = isLight ? '#FFFFFF' : '#0A192F';
  const redColor = '#CC0000';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Audrin Fire Engineers Emblem"
    >
      {/* Left Acoustic Signal Waves */}
      <path
        d="M32 40 C 22 55, 22 75, 32 90"
        stroke={redColor}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M20 30 C 6 52, 6 88, 20 110"
        stroke={redColor}
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Right Acoustic Signal Waves */}
      <path
        d="M128 40 C 138 55, 138 75, 128 90"
        stroke={redColor}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M140 30 C 154 52, 154 88, 140 110"
        stroke={redColor}
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Main Stylized Letter 'A' (Navy Blue) */}
      {/* Left Leg */}
      <path
        d="M80 18 L38 126 L62 126 L74 92 L86 92 L98 126 L122 126 Z"
        fill={navyColor}
      />
      {/* Upper Triangle Cutout */}
      <path
        d="M80 44 L70 76 L90 76 Z"
        fill={isLight ? '#0A192F' : '#FFFFFF'}
      />

      {/* Fire / Smoke Detector Chamber in Lower Arch */}
      <g transform="translate(80, 100)">
        {/* Detector Outer Flange & Housing */}
        <path
          d="M -34 -14 C -34 -14, -26 14, 0 18 C 26 14, 34 -14, 34 -14 C 24 -18, -24 -18, -34 -14 Z"
          fill={navyColor}
        />
        {/* Metallic Slotted Vent Grill */}
        <path
          d="M -26 -8 C -20 8, 0 12, 26 -8 C 18 -12, -18 -12, -26 -8 Z"
          fill="#FFFFFF"
        />
        {/* Detector Air Intake Slits */}
        <line x1="-16" y1="-5" x2="-16" y2="4" stroke={navyColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="-8" y1="-6" x2="-8" y2="7" stroke={navyColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="0" y1="-6" x2="0" y2="8" stroke={navyColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="8" y1="-6" x2="8" y2="7" stroke={navyColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="16" y1="-5" x2="16" y2="4" stroke={navyColor} strokeWidth="2.5" strokeLinecap="round" />

        {/* Central Red Optical Chamber / Alarm Indicator LED */}
        <ellipse cx="0" cy="11" rx="8" ry="4" fill={redColor} />
      </g>
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'dark',
  showTagline = true,
  className = '',
  size = 'md',
  layout = 'horizontal'
}) => {
  const isLightOrWhite = variant === 'white' || variant === 'light';

  const pixelSizes = {
    sm: 34,
    md: 46,
    lg: 58,
    xl: 72
  };

  const titleSizes = {
    sm: 'text-base font-black tracking-tight leading-none',
    md: 'text-xl font-black tracking-tight leading-none',
    lg: 'text-2xl font-black tracking-tight leading-none',
    xl: 'text-3xl font-black tracking-tight leading-none'
  };

  const subtitleSizes = {
    sm: 'text-[9px] tracking-[0.24em] font-bold mt-1',
    md: 'text-[11px] tracking-[0.26em] font-extrabold mt-1',
    lg: 'text-[13px] tracking-[0.28em] font-extrabold mt-1.5',
    xl: 'text-[16px] tracking-[0.3em] font-extrabold mt-2'
  };

  if (layout === 'mark-only') {
    return <AudrinLogoMark size={pixelSizes[size]} isLight={isLightOrWhite} className={className} />;
  }

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        <AudrinLogoMark size={pixelSizes[size] * 1.3} isLight={isLightOrWhite} />
        <div className="mt-2.5">
          <span className={`font-black ${titleSizes[size]} ${isLightOrWhite ? 'text-white' : 'text-[#0A192F]'}`}>
            AUDRIN
          </span>
          <div className={`text-[#CC0000] uppercase ${subtitleSizes[size]}`}>
            FIRE ENGINEERS
          </div>
          {showTagline && (
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
              Fire Detection & Alarm Systems | SANS 10139
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Official High-Resolution Vector Emblem */}
      <AudrinLogoMark size={pixelSizes[size]} isLight={isLightOrWhite} />

      {/* Official Typography Hierarchy */}
      <div className="flex flex-col justify-center">
        <div className={`font-black ${titleSizes[size]} ${isLightOrWhite ? 'text-white' : 'text-[#0A192F]'}`}>
          AUDRIN
        </div>
        <div className={`text-[#CC0000] uppercase ${subtitleSizes[size]} whitespace-nowrap`}>
          FIRE ENGINEERS
        </div>
        {showTagline && (
          <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 mt-0.5 whitespace-nowrap">
            Fire Detection & Alarm Systems
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Generates an SVG string representation of the official logo suitable for embedding in HTML emails
 */
export function getAudrinLogoSvgHtml(width = 300, height = 75): string {
  return `
  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
    <tr>
      <td style="vertical-align: middle; padding-right: 14px;">
        <svg width="56" height="50" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 40 C 22 55, 22 75, 32 90" stroke="#CC0000" stroke-width="7" stroke-linecap="round"/>
          <path d="M20 30 C 6 52, 6 88, 20 110" stroke="#CC0000" stroke-width="7" stroke-linecap="round"/>
          <path d="M128 40 C 138 55, 138 75, 128 90" stroke="#CC0000" stroke-width="7" stroke-linecap="round"/>
          <path d="M140 30 C 154 52, 154 88, 140 110" stroke="#CC0000" stroke-width="7" stroke-linecap="round"/>
          <path d="M80 18 L38 126 L62 126 L74 92 L86 92 L98 126 L122 126 Z" fill="#0A192F"/>
          <path d="M80 44 L70 76 L90 76 Z" fill="#FFFFFF"/>
          <g transform="translate(80, 100)">
            <path d="M -34 -14 C -34 -14, -26 14, 0 18 C 26 14, 34 -14, 34 -14 C 24 -18, -24 -18, -34 -14 Z" fill="#0A192F"/>
            <path d="M -26 -8 C -20 8, 0 12, 26 -8 C 18 -12, -18 -12, -26 -8 Z" fill="#FFFFFF"/>
            <line x1="-16" y1="-5" x2="-16" y2="4" stroke="#0A192F" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="-8" y1="-6" x2="-8" y2="7" stroke="#0A192F" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="0" y1="-6" x2="0" y2="8" stroke="#0A192F" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="8" y1="-6" x2="8" y2="7" stroke="#0A192F" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="16" y1="-5" x2="16" y2="4" stroke="#0A192F" stroke-width="2.5" stroke-linecap="round"/>
            <ellipse cx="0" cy="11" rx="8" ry="4" fill="#CC0000"/>
          </g>
        </svg>
      </td>
      <td style="vertical-align: middle;">
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 900; color: #0A192F; letter-spacing: -0.5px; line-height: 1;">
          AUDRIN
        </div>
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 800; color: #CC0000; letter-spacing: 0.28em; margin-top: 3px; text-transform: uppercase;">
          FIRE ENGINEERS
        </div>
      </td>
    </tr>
  </table>
  `.trim();
}
