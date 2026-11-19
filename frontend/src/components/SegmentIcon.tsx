// Segmente özgü sade araç siluetleri (yan profil).
const PATHS: Record<string, string> = {
  hatchback: 'M6,30 L6,24 Q7,19 14,18 L22,12 Q26,9 32,9 L42,9 Q46,10 48,16 L56,19 Q58,20 58,24 L58,30 Z',
  sedan: 'M4,30 L4,24 Q5,20 12,19 L22,12 Q26,10 32,10 L42,10 Q46,11 50,17 L58,19 Q60,20 60,24 L60,30 Z',
  suv: 'M5,31 L5,20 Q6,16 12,15 L18,8 Q20,6 26,6 L48,6 Q52,6 54,12 L58,16 Q60,17 60,21 L60,31 Z',
  luxury: 'M3,30 L3,25 Q4,21 12,20 L24,13 Q29,11 36,11 L44,11 Q49,12 53,17 L60,20 Q62,21 62,25 L62,30 Z',
  commercial: 'M4,31 L4,12 Q4,6 10,6 L34,6 L34,16 L46,16 Q50,16 53,20 L58,23 Q60,24 60,27 L60,31 Z',
}

export function SegmentIcon({ segmentId }: { segmentId: string }) {
  return (
    <svg viewBox="0 0 66 40" className="segment-icon" aria-hidden="true">
      <path d={PATHS[segmentId] ?? PATHS.sedan} fill="currentColor" />
      <circle cx="17" cy="31" r="5.5" fill="var(--bg-2)" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="49" cy="31" r="5.5" fill="var(--bg-2)" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  )
}
