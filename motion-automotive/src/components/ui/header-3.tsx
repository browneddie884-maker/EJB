'use client';
/**
 * Adapted from 21st.dev "Header 3" (efferd/header-3).
 * Motion Automotive changes: rental menus and app routes (react-router links), the site's
 * brand mark and theme toggle, page-width container, a passive scroll listener, and an
 * `overlay` mode so the home landing can sit underneath the bar (light text over the hero video).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
	CalendarDays,
	CarFront,
	Gem,
	HelpCircle,
	type LucideIcon,
	Phone,
	Plane,
	ShieldCheck,
	Ticket,
	Truck,
	UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Logo } from '@/components/logo';
import { ThemeToggleButton } from '@/components/theme-toggle';
import { business } from '@/config/business';
import { cn } from '@/lib/utils';

type LinkItem = {
	title: string;
	href: string;
	icon: LucideIcon;
	description?: string;
	/** Plain anchor (tel:, mailto:) instead of an app route. */
	external?: boolean;
};

const rentLinks: LinkItem[] = [
	{ title: 'Whole fleet', href: '/fleet', description: 'Every car, filtered by type, make and dates', icon: CarFront },
	{ title: 'Airport rentals', href: '/airport-car-rental', description: 'Pick up at the Baton Rouge airport', icon: Plane },
	{ title: 'Truck rentals', href: '/truck-rental', description: 'Tacoma, F-150 and Raptor', icon: Truck },
	{ title: 'Luxury cars', href: '/luxury-car-rental', description: 'Porsche, BMW, Audi, AMG and more', icon: Gem },
	{ title: 'Weekly rentals', href: '/weekly-car-rental', description: '7 days or more for less', icon: CalendarDays },
];

const helpLinks: LinkItem[] = [
	{ title: 'My booking', href: '/reservations', description: 'Change dates or cancel', icon: Ticket },
	{ title: 'Insurance options', href: '/#protection', description: 'Use your own policy or ours', icon: ShieldCheck },
	{ title: 'Questions', href: '/#faq', description: 'Age, deposits, cancellations', icon: HelpCircle },
];

const helpLinks2: LinkItem[] = [
	{ title: business.phone, href: `tel:${business.phone.replace(/[^\d+]/g, '')}`, icon: Phone, external: true },
	{ title: 'Staff login', href: '/staff', icon: UserRound },
];

export function Header({ overlay = false }: { overlay?: boolean }) {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);
	const close = () => setOpen(false);

	React.useEffect(() => {
		document.body.style.overflow = open ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn('sticky top-0 z-50 w-full border-b border-transparent text-foreground', overlay && '-mb-16', overlay && !scrolled && !open && 'dark', {
				'bg-background/95 supports-[backdrop-filter]:bg-background/85 border-border backdrop-blur-lg': scrolled || open,
			})}
		>
			<nav className="container-page flex h-16 items-center justify-between gap-4">
				<div className="flex items-center gap-5">
					{/* On the home page the landing shows the big logo, so this one appears once you scroll. */}
					<Link
						to="/"
						onClick={close}
						aria-label={`${business.name} home`}
						className={cn('rounded-md py-1 pr-2 transition-opacity duration-300', overlay && !scrolled && !open && 'pointer-events-none opacity-0')}
					>
						<Logo eager className="h-9 sm:h-10" />
					</Link>
					<NavigationMenu className="hidden md:flex">
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuTrigger className="bg-transparent">Rent</NavigationMenuTrigger>
								<NavigationMenuContent className="bg-background p-1 pr-1.5">
									<ul className="bg-popover grid w-lg grid-cols-2 gap-2 rounded-md border p-2 shadow">
										{rentLinks.map((item) => (
											<li key={item.title}>
												<ListItem {...item} />
											</li>
										))}
									</ul>
									<div className="p-2">
										<p className="text-muted-foreground text-sm">
											Not sure what to pick?{' '}
											<a href={`tel:${business.phone.replace(/[^\d+]/g, '')}`} className="text-foreground font-medium hover:underline">
												Call {business.phone}
											</a>
										</p>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuTrigger className="bg-transparent">Help</NavigationMenuTrigger>
								<NavigationMenuContent className="bg-background p-1 pr-1.5 pb-1.5">
									<div className="grid w-lg grid-cols-2 gap-2">
										<ul className="bg-popover space-y-2 rounded-md border p-2 shadow">
											{helpLinks.map((item) => (
												<li key={item.title}>
													<ListItem {...item} />
												</li>
											))}
										</ul>
										<ul className="space-y-2 p-3">
											{helpLinks2.map((item) => (
												<li key={item.title}>
													<NavigationMenuLink asChild className="flex flex-row items-center gap-x-2 rounded-md p-2 hover:bg-accent">
														<ItemAnchor item={item}>
															<item.icon className="text-foreground size-4" />
															<span className="font-medium">{item.title}</span>
														</ItemAnchor>
													</NavigationMenuLink>
												</li>
											))}
										</ul>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuLink className="px-4" asChild>
								<Link to="/#pricing" className="hover:bg-accent rounded-md p-2 text-sm font-medium">
									Pricing
								</Link>
							</NavigationMenuLink>
						</NavigationMenuList>
					</NavigationMenu>
				</div>
				<div className="flex items-center gap-2">
					<ThemeToggleButton />
					<Link to="/fleet" className="btn-signal hidden md:inline-flex">
						Find a car
					</Link>
					<Button
						size="icon"
						variant="outline"
						onClick={() => setOpen(!open)}
						className="rounded-full md:hidden"
						aria-expanded={open}
						aria-controls="mobile-menu"
						aria-label="Toggle menu"
					>
						<MenuToggleIcon open={open} className="size-5" duration={300} />
					</Button>
				</div>
			</nav>
			<MobileMenu open={open} className="flex flex-col justify-between gap-2 overflow-y-auto">
				<NavigationMenu className="max-w-full items-start">
					<div className="flex w-full flex-col gap-y-2">
						<span className="text-muted-foreground text-sm">Rent</span>
						{rentLinks.map((link) => (
							<ListItem key={link.title} {...link} onClick={close} />
						))}
						<span className="text-muted-foreground mt-2 text-sm">Help</span>
						{[...helpLinks, ...helpLinks2].map((link) => (
							<ListItem key={link.title} {...link} onClick={close} />
						))}
					</div>
				</NavigationMenu>
				<div className="flex flex-col gap-2 pb-2">
					<Link to="/#pricing" onClick={close} className="btn-ghost w-full">
						Pricing
					</Link>
					<Link to="/fleet" onClick={close} className="btn-signal w-full">
						Find a car
					</Link>
				</div>
			</MobileMenu>
		</header>
	);
}

type MobileMenuProps = React.ComponentProps<'div'> & {
	open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
	if (!open || typeof window === 'undefined') return null;

	return createPortal(
		<div
			id="mobile-menu"
			className={cn(
				'bg-background/95 supports-[backdrop-filter]:bg-background/80 text-foreground backdrop-blur-lg',
				'fixed top-16 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y md:hidden',
			)}
		>
			<div
				data-slot={open ? 'open' : 'closed'}
				className={cn('data-[slot=open]:animate-in data-[slot=open]:zoom-in-97 ease-out', 'size-full p-4', className)}
				{...props}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}

/** App routes go through the router; phone and email links stay plain anchors. */
const ItemAnchor = React.forwardRef<
	HTMLAnchorElement,
	{ item: LinkItem; children: React.ReactNode; onClick?: () => void } & React.ComponentProps<'a'>
>(({ item, children, onClick, ...props }, ref) =>
	item.external ? (
		<a ref={ref} href={item.href} onClick={onClick} {...props}>
			{children}
		</a>
	) : (
		<Link ref={ref} to={item.href} onClick={onClick} {...props}>
			{children}
		</Link>
	),
);
ItemAnchor.displayName = 'ItemAnchor';

function ListItem({ title, description, icon: Icon, href, external, onClick }: LinkItem & { onClick?: () => void }) {
	return (
		<NavigationMenuLink
			className="w-full flex flex-row gap-x-2 data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-sm p-2"
			asChild
		>
			<ItemAnchor item={{ title, href, icon: Icon, external }} onClick={onClick}>
				<div className="bg-background/40 flex aspect-square size-12 shrink-0 items-center justify-center rounded-md border shadow-sm">
					<Icon className="text-foreground size-5" />
				</div>
				<div className="flex flex-col items-start justify-center">
					<span className="font-medium">{title}</span>
					{description && <span className="text-muted-foreground text-xs">{description}</span>}
				</div>
			</ItemAnchor>
		</NavigationMenuLink>
	);
}

function useScroll(threshold: number) {
	const [scrolled, setScrolled] = React.useState(false);

	React.useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > threshold);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, [threshold]);

	return scrolled;
}
