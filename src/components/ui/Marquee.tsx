const ITEMS = [
  'FUEL YOUR RAGE',
  'PREMIUM SUPPLEMENTS',
  'NO FILLERS',
  'REAL RESULTS',
  'ENGINEERED TO PERFORM',
  'TESTED QUALITY',
  'PURE FORMULAS',
  'TRAIN HARDER',
  'ZERO COMPROMISE',
]

interface MarqueeProps {
  /** White background with black text — for contrast against dark sections */
  inverted?: boolean
  slow?: boolean
}

export default function Marquee({ inverted = false, slow = false }: MarqueeProps) {
  // Duplicate for seamless infinite loop
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div
      className={`overflow-hidden py-3 ${
        inverted
          ? 'bg-white border-y border-zinc-200'
          : 'bg-black border-y border-zinc-800'
      }`}
    >
      <div
        className={`flex whitespace-nowrap ${slow ? 'animate-marquee-slow' : 'animate-marquee'}`}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-6 px-6 text-[10px] font-bold tracking-[0.35em] uppercase ${
              inverted ? 'text-black' : 'text-zinc-600'
            }`}
          >
            {item}
            <span
              className={`text-[6px] ${inverted ? 'text-zinc-300' : 'text-zinc-800'}`}
            >
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
