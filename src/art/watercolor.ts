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
  </defs>
</svg>`

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
    <path d="M-20 150 C60 130 120 138 180 150 L180 175 L-20 175 Z" fill="#b7c1ac" opacity="0.7" filter="url(#wcSoft)"/>

    <!-- sea -->
    <path d="M-20 150 L420 150 L420 214 C320 224 300 206 200 214 C120 220 60 206 -20 214 Z"
          fill="url(#bSea)" filter="url(#wcBleed)"/>
    <!-- ink wave strokes -->
    <g class="wc-waves" stroke="${INK}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.45" filter="url(#wcInk)">
      <path d="M40 172 q14 -6 28 0 q14 6 28 0"/>
      <path d="M150 184 q14 -6 28 0 q14 6 28 0"/>
      <path d="M260 176 q14 -6 28 0 q14 6 28 0"/>
      <path d="M90 196 q16 -6 32 0 q16 6 32 0"/>
      <path d="M220 200 q16 -6 32 0 q16 6 32 0"/>
    </g>

    <!-- sand foreground -->
    <path d="M-20 206 C90 196 150 214 230 206 C300 199 360 210 420 204 L420 320 L-20 320 Z"
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

/** A loose pen-and-wash fox character — washes underneath, boiling ink line on top. */
export function foxArt(): string {
  return `
  <svg class="vn-sprite vn-char" viewBox="0 0 200 220" aria-hidden="true">
    <!-- soft contact shadow -->
    <ellipse cx="100" cy="204" rx="62" ry="12" fill="#5a4a36" opacity="0.16" filter="url(#wcSoft)"/>

    <!-- WASHES (no outline) -->
    <g filter="url(#wcBleed)">
      <!-- tail -->
      <path d="M150 150 C188 138 196 96 176 80 C168 120 140 130 132 150 Z" fill="#d6884a"/>
      <path d="M176 80 C186 92 184 110 172 118 C172 100 172 90 176 80 Z" fill="#f3e6d2"/>
      <!-- body -->
      <path d="M64 196 C50 150 58 120 100 118 C142 120 150 150 136 196 Z" fill="#dc8c4d"/>
      <!-- chest -->
      <path d="M84 196 C76 158 84 138 100 138 C116 138 124 158 116 196 Z" fill="#f4e7d4"/>
      <!-- head -->
      <path d="M100 60 C140 60 150 96 138 122 C128 142 116 150 100 150 C84 150 72 142 62 122 C50 96 60 60 100 60 Z" fill="#dc8c4d"/>
      <!-- ears -->
      <path d="M70 70 L58 30 L96 58 Z" fill="#d6884a"/>
      <path d="M130 70 L142 30 L104 58 Z" fill="#d6884a"/>
      <path d="M73 64 L66 42 L90 58 Z" fill="#f3e6d2"/>
      <path d="M127 64 L134 42 L110 58 Z" fill="#f3e6d2"/>
      <!-- muzzle -->
      <path d="M100 98 C122 98 130 120 122 136 C116 148 108 150 100 150 C92 150 84 148 78 136 C70 120 78 98 100 98 Z" fill="#faf1e3"/>
    </g>

    <!-- INK LINE (boiling) -->
    <g fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" filter="url(#wcInk)">
      <path d="M100 60 C140 60 150 96 138 122 C128 142 116 150 100 150 C84 150 72 142 62 122 C50 96 60 60 100 60 Z"/>
      <path d="M70 70 L58 30 L96 58"/>
      <path d="M130 70 L142 30 L104 58"/>
      <path d="M64 196 C50 150 58 120 100 118 C142 120 150 150 136 196"/>
      <path d="M150 150 C188 138 196 96 176 80"/>
      <path d="M100 98 C122 98 130 120 122 136 C116 148 108 150 100 150 C92 150 84 148 78 136 C70 120 78 98 100 98 Z"/>
    </g>

    <!-- face -->
    <g filter="url(#wcInk)">
      <ellipse cx="84" cy="106" rx="5.5" ry="7" fill="${INK}"/>
      <ellipse cx="116" cy="106" rx="5.5" ry="7" fill="${INK}"/>
      <circle cx="86" cy="103" r="1.8" fill="#fff"/>
      <circle cx="118" cy="103" r="1.8" fill="#fff"/>
      <path d="M100 128 C94 128 91 132 94 135 C97 138 100 139 100 139 C100 139 103 138 106 135 C109 132 106 128 100 128 Z" fill="${INK}"/>
      <path d="M100 139 C100 146 94 149 89 147" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M100 139 C100 146 106 149 111 147" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    </g>
  </svg>`
}
