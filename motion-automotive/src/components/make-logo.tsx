import { cn } from '@/lib/utils'

const logos = import.meta.glob<string>('../assets/logos/*.svg', { eager: true, import: 'default' })

/** Simple Icons slugs (files in src/assets/logos). Makes without an entry fall back to a monogram. */
const slugs: Record<string, string> = {
  Toyota: 'toyota', Honda: 'honda', Tesla: 'tesla', Ford: 'ford', Chevrolet: 'chevrolet',
  BMW: 'bmw', Audi: 'audi', Porsche: 'porsche',
}

export function MakeLogo({ make, className }: { make: string; className?: string }) {
  const slug = slugs[make]
  const src = slug ? logos[`../assets/logos/${slug}.svg`] : undefined
  if (!src) {
    return (
      <span className={cn('inline-flex items-center justify-center rounded-full border border-current text-[10px] font-semibold', className)} aria-hidden>
        {make.slice(0, 1)}
      </span>
    )
  }
  const url = `url("${src}")`
  return (
    <span
      aria-hidden
      className={cn('inline-block bg-current', className)}
      style={{ maskImage: url, WebkitMaskImage: url, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }}
    />
  )
}
