import { business } from '@/config/business'
import { cn } from '@/lib/utils'

const icons = import.meta.glob<string>('../assets/social/*.svg', { eager: true, import: 'default' })

const networks = [
  { key: 'instagram', label: 'Instagram', icon: 'instagram' },
  { key: 'facebook', label: 'Facebook', icon: 'facebook' },
  { key: 'tiktok', label: 'TikTok', icon: 'tiktok' },
  { key: 'x', label: 'X', icon: 'x' },
  { key: 'youtube', label: 'YouTube', icon: 'youtube' },
  { key: 'googleReviews', label: 'Google reviews', icon: 'google' },
] as const

/** Profiles that have a link set in business.social. */
export const socialProfiles = networks
  .map((n) => ({ ...n, href: business.social[n.key] }))
  .filter((n) => n.href)

/** Brand icons (Simple Icons) for each configured profile. Renders nothing until a link is added. */
export function SocialLinks({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  if (!socialProfiles.length) return null
  return (
    <ul className={cn('flex flex-wrap items-center gap-2', className)} aria-label="Follow us">
      {socialProfiles.map((n) => {
        const url = `url("${icons[`../assets/social/${n.icon}.svg`]}")`
        return (
          <li key={n.key}>
            <a
              href={n.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${business.name} on ${n.label}`}
              title={n.label}
              className={cn('flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground', iconClassName)}
            >
              <span
                aria-hidden
                className="h-4 w-4 bg-current"
                style={{ maskImage: url, WebkitMaskImage: url, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }}
              />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
