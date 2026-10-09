import { cn } from '@/lib/utils'

/** Simple Icons slugs. Makes without an entry fall back to a monogram. */
const slugs: Record<string, string> = {
  Toyota: 'toyota', Honda: 'honda', Tesla: 'tesla', Ford: 'ford', Chevrolet: 'chevrolet',
  BMW: 'bmw', Audi: 'audi', Porsche: 'porsche',
}

export function MakeLogo({ make, className }: { make: string; className?: string }) {
  const slug = slugs[make]
  if (!slug) {
    return (
      <span className={cn('inline-flex items-center justify-center rounded-full border border-current text-[10px] font-semibold', className)} aria-hidden>
        {make.slice(0, 1)}
      </span>
    )
  }
  const url = `url(https://cdn.simpleicons.org/${slug})`
  return (
    <span
      aria-hidden
      className={cn('inline-block bg-current', className)}
      style={{ maskImage: url, WebkitMaskImage: url, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }}
    />
  )
}
