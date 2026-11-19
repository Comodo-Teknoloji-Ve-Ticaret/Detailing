// Yan profil araç illüstrasyonu — "öncesi" (mat, hareli, tozlu) ve "sonrası" (derin parlak) varyantları.
import { useId } from 'react'

export type Finish = 'gloss' | 'matte'

interface Props {
  variant: 'before' | 'after'
  color: string
  finish: Finish
  beads?: boolean
}

const BODY =
  'M60,232 L60,203 Q62,178 102,170 L232,152 Q302,97 382,90 L522,90 Q592,94 652,147 L732,162 Q762,168 766,197 L766,232 Q766,242 756,242 L702,242 A57,57 0 0 0 588,242 L272,242 A57,57 0 0 0 158,242 L70,242 Q60,242 60,232 Z'

const BEADS = [
  [420, 128, 3.2], [455, 138, 2.4], [500, 125, 2.8], [540, 134, 2.1], [610, 160, 3], [660, 170, 2.6],
  [700, 178, 3.4], [330, 175, 2.5], [370, 190, 3.1], [300, 200, 2.2], [480, 185, 2.7], [560, 192, 3.3],
  [640, 200, 2.4], [250, 185, 3], [200, 192, 2.3], [140, 200, 2.8], [520, 210, 2.2], [410, 215, 2.9],
  [720, 205, 2.5], [110, 188, 2.1], [590, 175, 2], [350, 160, 2.6],
] as const

function Wheel({ cx, id }: { cx: number; id: string }) {
  return (
    <g>
      <circle cx={cx} cy={242} r={47} fill="#0b0d10" />
      <circle cx={cx} cy={242} r={33} fill={`url(#${id}-rim)`} stroke="#2b3037" strokeWidth={2} />
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i * 72 * Math.PI) / 180
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * 8}
            y1={242 + Math.sin(a) * 8}
            x2={cx + Math.cos(a) * 30}
            y2={242 + Math.sin(a) * 30}
            stroke="#1b1f25"
            strokeWidth={7}
            strokeLinecap="round"
          />
        )
      })}
      <circle cx={cx} cy={242} r={8} fill="#3a4049" />
    </g>
  )
}

export function CarArt({ variant, color, finish, beads }: Props) {
  const raw = useId().replace(/:/g, '')
  const id = `car${raw}`
  const after = variant === 'after'
  const matte = after && finish === 'matte'

  return (
    <svg viewBox="0 0 826 330" className={`car-art car-art--${variant}`} role="img" aria-label={after ? 'İşlem sonrası araç' : 'İşlem öncesi araç'}>
      <defs>
        <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="0" y2="1">
          {after && !matte ? (
            <>
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="0.12" stopColor={color} />
              <stop offset="0.48" stopColor={color} />
              <stop offset="0.52" stopColor="#000" stopOpacity="0.55" />
              <stop offset="0.62" stopColor={color} />
              <stop offset="1" stopColor="#000" stopOpacity="0.85" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor={color} stopOpacity={matte ? 0.95 : 0.8} />
              <stop offset="1" stopColor={color} stopOpacity={matte ? 0.75 : 0.6} />
            </>
          )}
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={after ? '#5d6b7d' : '#3b4048'} />
          <stop offset="0.5" stopColor={after ? '#111821' : '#2a2e34'} />
          <stop offset="1" stopColor={after ? '#2a3a4d' : '#33373d'} />
        </linearGradient>
        <radialGradient id={`${id}-rim`}>
          <stop offset="0" stopColor={after ? '#d6dde6' : '#8a8f96'} />
          <stop offset="1" stopColor={after ? '#6f7883' : '#55595f'} />
        </radialGradient>
        <linearGradient id={`${id}-streak`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <pattern id={`${id}-swirl`} width="46" height="46" patternUnits="userSpaceOnUse">
          <circle cx="23" cy="23" r="9" fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="0.7" />
          <circle cx="23" cy="23" r="16" fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="0.7" />
          <circle cx="6" cy="8" r="0.9" fill="#d9c7a3" fillOpacity="0.55" />
          <circle cx="38" cy="36" r="1.2" fill="#d9c7a3" fillOpacity="0.45" />
          <path d="M2,40 L18,30" stroke="#fff" strokeOpacity="0.18" strokeWidth="0.6" />
        </pattern>
        <clipPath id={`${id}-body`}>
          <path d={BODY} />
        </clipPath>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-reflmask`}>
          <rect x="0" y="242" width="826" height="88" fill={`url(#${id}-fade)`} />
        </mask>
      </defs>

      {/* zemin gölgesi */}
      <ellipse cx="413" cy="292" rx="360" ry="10" fill="#000" opacity="0.55" />

      {/* showroom zemin yansıması — yalnızca parlak sonrası */}
      {after && !matte && (
        <g mask={`url(#${id}-reflmask)`} transform="translate(0 534) scale(1 -1)" opacity="0.9">
          <path d={BODY} fill={color} />
        </g>
      )}

      <path d={BODY} fill={`url(#${id}-paint)`} />

      <g clipPath={`url(#${id}-body)`}>
        {/* omuz çizgisi */}
        <path d="M102,186 L736,182" stroke="#000" strokeOpacity="0.35" strokeWidth="2" />
        {/* kapı hatları */}
        <path d="M445,96 L445,240 M300,150 L300,240 M590,150 L590,205" stroke="#000" strokeOpacity="0.3" strokeWidth="1.6" fill="none" />
        <rect x="360" y="192" width="34" height="6" rx="3" fill="#000" opacity="0.35" />
        <rect x="505" y="192" width="34" height="6" rx="3" fill="#000" opacity="0.35" />

        {after && !matte && (
          <>
            <rect x="-120" y="118" width="260" height="10" fill={`url(#${id}-streak)`} className="shine-sweep" />
            <path d="M120,176 L740,172" stroke="#fff" strokeOpacity="0.65" strokeWidth="2.2" />
            <path d="M240,150 Q310,100 380,94" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" fill="none" />
          </>
        )}
        {!after && <rect x="0" y="0" width="826" height="330" fill={`url(#${id}-swirl)`} />}
        {!after && <rect x="0" y="200" width="826" height="50" fill="#6b5a40" opacity="0.18" />}
      </g>

      {/* camlar */}
      <path d="M252,152 Q312,106 384,101 L438,101 L438,152 Z" fill={`url(#${id}-glass)`} />
      <path d="M452,101 L516,101 Q572,106 622,150 L452,152 Z" fill={`url(#${id}-glass)`} />
      {after && <path d="M270,148 L330,106 L345,106 L285,148 Z" fill="#fff" opacity="0.18" />}

      {/* far & stop */}
      <path d="M728,170 L760,178 Q762,190 752,190 L724,186 Z" fill={after ? '#e9f6ff' : '#9aa1a8'} opacity={after ? 1 : 0.7} />
      <path d="M62,188 L84,184 L86,198 L61,202 Z" fill={after ? '#ff3b3b' : '#7a3434'} />

      <Wheel cx={215} id={id} />
      <Wheel cx={645} id={id} />

      {after && beads && (
        <g>
          {BEADS.map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill="#fff" fillOpacity="0.18" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.6" />
              <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.3} fill="#fff" fillOpacity="0.9" />
            </g>
          ))}
        </g>
      )}
    </svg>
  )
}
