// Resolve a file in /public against the app's base path so assets work
// both at the domain root (dev) and under a subpath (GitHub Pages).
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}

export const FOX_ICON = asset('fox.svg')
