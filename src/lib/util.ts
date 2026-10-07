export const uid = (): string =>
  (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36))

export const nowIso = () => new Date().toISOString()

export function todayStr(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
export function parseDay(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export function halloween(from = new Date()) {
  const y = from.getMonth() === 10 && from.getDate() > 1 ? from.getFullYear() + 1 : from.getFullYear()
  return `${y}-10-31`
}
export function daysUntil(s: string, from = new Date()) {
  const a = parseDay(todayStr(from)).getTime()
  return Math.round((parseDay(s).getTime() - a) / 86400000)
}
export function addDays(s: string, n: number) {
  const d = parseDay(s); d.setDate(d.getDate() + n); return todayStr(d)
}
export function fmtDay(s?: string) {
  if (!s) return ''
  return parseDay(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })
}
export function relDay(s: string) {
  const n = daysUntil(s)
  if (n === 0) return 'today'
  if (n === 1) return 'tomorrow'
  if (n === -1) return 'yesterday'
  return n > 0 ? `in ${n} days` : `${-n} days ago`
}
export const money = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: n % 1 ? 2 : 0 })
export const num = (v: string) => (v.trim() === '' || isNaN(Number(v)) ? undefined : Number(v))

export function pick<T>(arr: T[], n: number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a.slice(0, n)
}
