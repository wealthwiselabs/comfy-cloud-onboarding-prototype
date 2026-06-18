/** Resolve a public/media asset, honoring Vite's BASE_URL (dev '/' vs GitHub Pages subpath). */
export function mediaUrl(name: string): string {
  return `${import.meta.env.BASE_URL}media/${name}`
}
