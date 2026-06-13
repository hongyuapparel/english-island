import { renderVoice } from './pages/voice'
import { renderCourses } from './pages/courses'
import { renderSettings } from './pages/settings'
import { renderNotes } from './pages/notes'
import { AGENT_NAME } from './types'

type Route = 'voice' | 'courses' | 'notes' | 'settings'

const NAV: { route: Route; label: string; icon: string }[] = [
  { route: 'voice', label: '语音对话', icon: '🎤' },
  { route: 'courses', label: '课程共读', icon: '📚' },
  { route: 'notes', label: '错句本', icon: '📝' },
  { route: 'settings', label: '设置', icon: '⚙️' },
]

let currentRoute: Route = 'voice'

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

  navigate(currentRoute)
}

function navigate(route: Route) {
  currentRoute = route
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', (btn as HTMLElement).dataset.route === route)
  })

  const main = document.querySelector('#main-content')!
  main.innerHTML = ''

  switch (route) {
    case 'voice':
      main.appendChild(renderVoice())
      break
    case 'courses':
      main.appendChild(renderCourses())
      break
    case 'settings':
      main.appendChild(renderSettings())
      break
    case 'notes':
      main.appendChild(renderNotes())
      break
  }

  const titles: Record<Route, string> = {
    voice: `语音对话 - ${AGENT_NAME}`,
    courses: `课程共读 - ${AGENT_NAME}`,
    notes: `错句本 - ${AGENT_NAME}`,
    settings: `设置 - ${AGENT_NAME}`,
  }
  document.title = titles[route]
}
