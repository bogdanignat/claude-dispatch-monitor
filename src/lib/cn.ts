/**
 * Tiny class-merging helper — no clsx/twMerge dependency.
 * Accepts strings, falsy values (skipped), or arrays (flattened one level).
 */
export function cn(...parts: Array<string | false | null | undefined | string[]>): string {
  const out: string[] = []
  for (const p of parts) {
    if (!p) continue
    if (Array.isArray(p)) out.push(...p.filter(Boolean))
    else out.push(p)
  }
  return out.join(' ')
}
