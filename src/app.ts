import { renderIsland } from './pages/island'
import { renderReading } from './pages/reading'
import { renderChat } from './pages/voice'
import { renderMe } from './pages/me'
import { APP_NAME_ZH } from './types'

export type Route = 'island' | 'reading' | 'chat' | 'me'

const NAV: { route: Route; label: string; icon: string }[] = [
  { route: 'island', label: '小岛', icon: '🏝️' },
  { route: 'reading', label: '故事', icon: '📖' },
  { route: 'chat', label: '对话', icon: '💬' },
  { route: 'me', label: '我的', icon: '👤' },
]

let currentRoute: Route = 'island'

export function navigate(route: Route) {
  currentRoute = route
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', (btn as HTMLElement).dataset.route === route)
  })

  const main = document.querySelector('#main-content')!
  main.innerHTML = ''

  switch (route) {
    case 'island':
      main.appendChild(renderIsland())
      break
    case 'reading':
      main.appendChild(renderReading())
      break
    case 'chat':
      main.appendChild(renderChat())
      break
    case 'me':
      main.appendChild(renderMe())
      break
  }

  const titles: Record<Route, string> = {
    island: `小岛 · ${APP_NAME_ZH}`,
    reading: `故事 · ${APP_NAME_ZH}`,
    chat: `对话 · ${APP_NAME_ZH}`,
    me: `我的 · ${APP_NAME_ZH}`,
  }
  document.title = titles[route]
  ;(main as HTMLElement).scrollTop = 0
}

export function initApp() {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    <div class="app-shell">
      <div class="main-content" id="main-content"></div>
      <nav class="bottom-nav" id="bottom-nav"></nav>
    </div>
  `

  const nav = app.querySelector('#bottom-nav')!
  NAV.forEach(({ route, label, icon }) => {
    const btn = document.createElement('button')
    btn.className = `nav-btn ${route === currentRoute ? 'active' : ''}`
    btn.dataset.route = route
    btn.innerHTML = `<span class="nav-icon">${icon}</span><span class="nav-label">${label}</span>`
    btn.addEventListener('click', () => navigate(route))
    nav.appendChild(btn)
  })

  window.addEventListener('ei-navigate', (e) => {
    navigate((e as CustomEvent<Route>).detail)
  })

  navigate(currentRoute)
}

/** Let any page jump to another tab. */
export function goTo(route: Route) {
  window.dispatchEvent(new CustomEvent('ei-navigate', { detail: route }))
}
