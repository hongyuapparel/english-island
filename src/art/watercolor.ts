// Hand-drawn "pen + watercolor" art for the story scenes, inspired by the
// look of Benjamin Renner's *The Big Bad Fox* (大坏狐狸):
//   · soft watercolor washes with bled, irregular edges  (feTurbulence + displace)
//   · warm charcoal ink linework that gently "boils"      (animated turbulence seed)
//   · a muted, papery palette
//
// Everything is plain SVG strings so it works on a static host with no assets.

/** Shared filter defs — injected once per scene render (hidden). */
export const WATERCOLOR_DEFS = `
<svg class="wc-defs" aria-hidden="true">
  <defs>
    <!-- watercolor wash: pushes fill edges around so they bleed like paint -->
    <filter id="wcBleed" x="-25%" y="-25%" width="150%" height="150%">
      <feTurbulence type="fractalNoise" baseFrequency="0.011 0.013" numOctaves="4" seed="8" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="17" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <!-- soft wash: bleed + a touch of blur for pooled-paint softness -->
    <filter id="wcSoft" x="-30%" y="-30%" width="160%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" seed="4" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="13" result="d"/>
      <feGaussianBlur in="d" stdDeviation="1.1"/>
    </filter>
    <!-- boiling ink line: the seed steps a few times a second for a hand-drawn wobble -->
    <filter id="wcInk" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="2" result="n">
        <animate attributeName="seed" values="2;9;5;13;2" dur="0.62s" calcMode="discrete" repeatCount="indefinite"/>
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.4" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <!-- static hand-drawn ink (no animation) — cheap enough for many map buildings -->
    <filter id="wcInkStatic" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="6" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
</svg>`

/** A small watercolor building for the island map (static ink for performance). */
export function buildingArt(roof: string, wall: string, emoji: string): string {
  return `
  <svg class="isl-building-svg" viewBox="0 0 100 112" aria-hidden="true">
    <ellipse cx="50" cy="102" rx="33" ry="7" fill="#5a4a36" opacity="0.18" filter="url(#wcSoft)"/>
    <g filter="url(#wcBleed)">
      <rect x="26" y="50" width="48" height="46" rx="4" fill="${wall}"/>
      <path d="M18 53 L50 24 L82 53 Z" fill="${roof}"/>
      <rect x="43" y="70" width="15" height="26" rx="3" fill="#a07a4c"/>
      <rect x="32" y="58" width="11" height="11" rx="2" fill="#cfe6ee"/>
      <rect x="58" y="58" width="11" height="11" rx="2" fill="#cfe6ee"/>
    </g>
    <g fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" filter="url(#wcInkStatic)">
      <rect x="26" y="50" width="48" height="46" rx="4"/>
      <path d="M18 53 L50 24 L82 53"/>
      <rect x="43" y="70" width="15" height="26" rx="3"/>
      <rect x="32" y="58" width="11" height="11" rx="2"/>
      <rect x="58" y="58" width="11" height="11" rx="2"/>
    </g>
    <text x="50" y="19" text-anchor="middle" font-size="20">${emoji}</text>
  </svg>`
}

const INK = '#4a3f37'

/** Does this location have a painted backdrop yet? */
export function hasSceneArt(spotId: string): boolean {
  return spotId === 'beach'
}

/** Painted watercolor backdrop for a location (empty string falls back to CSS gradient). */
export function sceneArt(spotId: string): string {
  if (spotId === 'beach') return beachArt()
  return ''
}

function beachArt(): string {
  return `
  <svg class="vn-backdrop" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="bSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f1e6cf"/>
        <stop offset="55%" stop-color="#e3e1cf"/>
        <stop offset="100%" stop-color="#cdd9cf"/>
      </linearGradient>
      <linearGradient id="bSea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#9cb9af"/>
        <stop offset="100%" stop-color="#7c9c93"/>
      </linearGradient>
      <linearGradient id="bSand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ecd9b0"/>
        <stop offset="100%" stop-color="#dcc189"/>
      </linearGradient>
    </defs>

    <!-- sky -->
    <rect x="-20" y="-20" width="440" height="220" fill="url(#bSky)"/>

    <!-- sun -->
    <g class="wc-sun">
      <circle cx="306" cy="74" r="40" fill="#f3d79a" opacity="0.55" filter="url(#wcSoft)"/>
      <circle cx="306" cy="74" r="40" fill="none" stroke="${INK}" stroke-width="1.4" opacity="0.5" filter="url(#wcInk)"/>
    </g>

    <!-- distant headland -->
    <path d="M-20 138 C60 120 120 128 180 138 L180 160 L-20 160 Z" fill="#b7c1ac" opacity="0.7" filter="url(#wcSoft)"/>

    <!-- sea -->
    <path d="M-20 138 L420 138 L420 176 C320 184 300 170 200 176 C120 181 60 170 -20 176 Z"
          fill="url(#bSea)" filter="url(#wcBleed)"/>
    <!-- ink wave strokes -->
    <g class="wc-waves" stroke="${INK}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.45" filter="url(#wcInk)">
      <path d="M40 150 q14 -6 28 0 q14 6 28 0"/>
      <path d="M150 160 q14 -6 28 0 q14 6 28 0"/>
      <path d="M260 154 q14 -6 28 0 q14 6 28 0"/>
      <path d="M90 168 q16 -6 32 0 q16 6 32 0"/>
      <path d="M220 170 q16 -6 32 0 q16 6 32 0"/>
    </g>

    <!-- sand foreground (comes up high so the fox stands on the beach) -->
    <path d="M-20 168 C90 160 150 176 230 168 C300 162 360 172 420 167 L420 320 L-20 320 Z"
          fill="url(#bSand)" filter="url(#wcBleed)"/>
    <!-- warm pooled shadow on sand -->
    <path d="M40 250 C140 238 240 262 360 248" fill="none" stroke="#c8a86a" stroke-width="16" opacity="0.3" filter="url(#wcSoft)"/>

    <!-- pebbles + a shell -->
    <g filter="url(#wcInk)" opacity="0.7">
      <ellipse cx="70" cy="262" rx="7" ry="4" fill="#cdbfa6" stroke="${INK}" stroke-width="0.9"/>
      <ellipse cx="96" cy="270" rx="5" ry="3" fill="#d8cbb2" stroke="${INK}" stroke-width="0.9"/>
      <g transform="translate(330 264)">
        <path d="M0 0 C-9 -2 -9 -12 0 -13 C9 -12 9 -2 0 0 Z" fill="#f0dcc4" stroke="${INK}" stroke-width="0.9"/>
        <path d="M0 -1 L-3 -11 M0 -1 L0 -12 M0 -1 L3 -11" stroke="${INK}" stroke-width="0.7" fill="none"/>
      </g>
    </g>

    <!-- dune grass tufts -->
    <g class="wc-grass" stroke="${INK}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.6" filter="url(#wcInk)">
      <g class="wc-grass-a">
        <path d="M26 280 C24 262 20 254 14 246"/>
        <path d="M30 280 C30 260 32 252 38 244"/>
        <path d="M34 280 C34 264 36 258 44 252"/>
      </g>
      <g class="wc-grass-b">
        <path d="M372 282 C370 262 366 254 360 246"/>
        <path d="M376 282 C376 262 378 254 384 246"/>
      </g>
    </g>

    <!-- gulls -->
    <g class="wc-birds" stroke="${INK}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.65" filter="url(#wcInk)">
      <path d="M120 60 q8 -7 15 0 q7 -7 15 0"/>
      <path d="M170 48 q6 -5 11 0 q5 -5 11 0"/>
    </g>
  </svg>`
}

/** A chibi-cute pen-and-wash fox — big head, big shiny eyes, rosy cheeks. */
export function foxArt(): string {
  return `
  <svg class="vn-sprite vn-char" viewBox="0 0 200 220" aria-hidden="true">
    <!-- soft contact shadow -->
    <ellipse cx="100" cy="208" rx="56" ry="11" fill="#5a4a36" opacity="0.16" filter="url(#wcSoft)"/>

    <!-- WASHES (no outline) -->
    <g filter="url(#wcBleed)">
      <!-- fluffy tail curling beside the body -->
      <path d="M150 178 C192 168 198 116 172 96 C160 124 150 150 128 172 Z" fill="#e3995c"/>
      <path d="M172 96 C186 108 184 130 168 138 C171 118 171 104 172 96 Z" fill="#f8eedd"/>
      <!-- small round body -->
      <path d="M70 204 C58 174 66 152 100 152 C134 152 142 174 130 204 Z" fill="#e6985a"/>
      <!-- cream belly -->
      <path d="M86 204 C80 180 86 164 100 164 C114 164 120 180 114 204 Z" fill="#f9efe0"/>
      <!-- front paws -->
      <ellipse cx="84" cy="202" rx="11" ry="9" fill="#e6985a"/>
      <ellipse cx="116" cy="202" rx="11" ry="9" fill="#e6985a"/>
      <!-- big round head -->
      <path d="M100 40 C152 40 162 84 151 116 C142 146 122 158 100 158 C78 158 58 146 49 116 C38 84 48 40 100 40 Z" fill="#e6985a"/>
      <!-- ears (rounded, perky) -->
      <path d="M60 60 C46 30 56 20 78 42 C70 50 64 54 60 60 Z" fill="#e3995c"/>
      <path d="M140 60 C154 30 144 20 122 42 C130 50 136 54 140 60 Z" fill="#e3995c"/>
      <path d="M64 54 C56 38 62 33 74 45 Z" fill="#f4ddca"/>
      <path d="M136 54 C144 38 138 33 126 45 Z" fill="#f4ddca"/>
      <!-- cream muzzle/cheeks (wide for chibi look) -->
      <path d="M100 94 C130 94 140 118 130 138 C121 153 110 158 100 158 C90 158 79 153 70 138 C60 118 70 94 100 94 Z" fill="#fcf5ea"/>
    </g>

    <!-- INK LINE (boiling) -->
    <g fill="none" stroke="${INK}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" filter="url(#wcInk)">
      <path d="M100 40 C152 40 162 84 151 116 C142 146 122 158 100 158 C78 158 58 146 49 116 C38 84 48 40 100 40 Z"/>
      <path d="M60 60 C46 30 56 20 78 42"/>
      <path d="M140 60 C154 30 144 20 122 42"/>
      <path d="M70 204 C58 174 66 152 100 152 C134 152 142 174 130 204"/>
      <path d="M150 178 C192 168 198 116 172 96"/>
    </g>

    <!-- face -->
    <g>
      <!-- rosy blush -->
      <ellipse cx="72" cy="124" rx="11" ry="6.5" fill="#f0a39c" opacity="0.55" filter="url(#wcSoft)"/>
      <ellipse cx="128" cy="124" rx="11" ry="6.5" fill="#f0a39c" opacity="0.55" filter="url(#wcSoft)"/>
      <g filter="url(#wcInk)">
        <!-- big sparkly eyes -->
        <ellipse cx="79" cy="108" rx="9.5" ry="11.5" fill="${INK}"/>
        <ellipse cx="121" cy="108" rx="9.5" ry="11.5" fill="${INK}"/>
        <circle cx="83" cy="103" r="3.8" fill="#fff"/>
        <circle cx="125" cy="103" r="3.8" fill="#fff"/>
        <circle cx="75" cy="112" r="1.9" fill="#fff" opacity="0.85"/>
        <circle cx="117" cy="112" r="1.9" fill="#fff" opacity="0.85"/>
        <!-- little nose -->
        <path d="M100 126 C93 126 90 130 94 133 C97 136 100 137 100 137 C100 137 103 136 106 133 C110 130 107 126 100 126 Z" fill="${INK}"/>
        <!-- happy smile -->
        <path d="M100 137 C100 145 92 148 86 145" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M100 137 C100 145 108 148 114 145" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
      </g>
    </g>
  </svg>`
}
