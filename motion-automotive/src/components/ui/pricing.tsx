"use client";

/**
 * Adapted from 21st.dev "Pricing" (ravikatiyar162/pricing): starfield background,
 * sliding two-option toggle with confetti, NumberFlow prices and a highlighted plan.
 *
 * Motion Automotive changes: react-router links instead of next/link, `motion/react`
 * instead of framer-motion, the site's shadcn button and theme tokens, configurable
 * toggle labels and price notes (daily/weekly instead of monthly/annual), an optional
 * per-plan badge and price prefix, and no starfield motion or confetti for visitors who
 * prefer reduced motion.
 */
import { motion, useReducedMotion, useSpring } from "motion/react";
import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import confetti from "canvas-confetti";
import { Link } from "react-router-dom";
import { Check, Star as LucideStar } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }
    const result = matchMedia(query);
    result.addEventListener("change", onChange);
    setValue(result.matches);
    return () => result.removeEventListener("change", onChange);
  }, [query]);

  return value;
}

// --- INTERACTIVE STARFIELD ---

function Star({
  mousePosition,
  containerRef,
}: {
  mousePosition: { x: number | null; y: number | null };
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [initial] = useState(() => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${1 + Math.random() * 2}px`,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 5,
  }));

  const springConfig = { stiffness: 100, damping: 15, mass: 0.1 };
  const springX = useSpring(0, springConfig);
  const springY = useSpring(0, springConfig);

  useEffect(() => {
    if (!containerRef.current || mousePosition.x === null || mousePosition.y === null) {
      springX.set(0);
      springY.set(0);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const starX = containerRect.left + (parseFloat(initial.left) / 100) * containerRect.width;
    const starY = containerRect.top + (parseFloat(initial.top) / 100) * containerRect.height;

    const deltaX = mousePosition.x - starX;
    const deltaY = mousePosition.y - starY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const radius = 600; // Radius of magnetic influence

    if (distance < radius) {
      const force = 1 - distance / radius;
      springX.set(deltaX * force * 0.5);
      springY.set(deltaY * force * 0.5);
    } else {
      springX.set(0);
      springY.set(0);
    }
  }, [mousePosition, initial, containerRef, springX, springY]);

  return (
    <motion.div
      className="absolute rounded-full bg-foreground"
      style={{ top: initial.top, left: initial.left, width: initial.size, height: initial.size, x: springX, y: springY }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: initial.duration, repeat: Infinity, delay: initial.delay }}
    />
  );
}

function InteractiveStarfield({
  mousePosition,
  containerRef,
}: {
  mousePosition: { x: number | null; y: number | null };
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden" aria-hidden>
      {Array.from({ length: 150 }).map((_, i) => (
        <Star key={`star-${i}`} mousePosition={mousePosition} containerRef={containerRef} />
      ))}
    </div>
  );
}

// --- PRICING COMPONENT LOGIC ---

export interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular?: boolean;
  /** Text on the highlighted plan's badge. @default "Most Popular" */
  badge?: string;
  /** Shown before the price, e.g. "from". */
  pricePrefix?: string;
}

interface PricingSectionProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  /** Toggle labels. @default ["Monthly", "Annual"] */
  options?: [string, string];
  /** Shown next to the second option. @default "(Save 20%)" */
  savings?: string;
  /** Line under the price for each option. @default ["Billed Monthly", "Billed Annually"] */
  notes?: [string, string];
  id?: string;
  className?: string;
}

const PricingContext = createContext<{
  isMonthly: boolean;
  setIsMonthly: (value: boolean) => void;
  notes: [string, string];
}>({
  isMonthly: true,
  setIsMonthly: () => {},
  notes: ["Billed Monthly", "Billed Annually"],
});

export function PricingSection({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that's right for you. All plans include our core features and support.",
  options = ["Monthly", "Annual"],
  savings = "(Save 20%)",
  notes = ["Billed Monthly", "Billed Annually"],
  id,
  className,
}: PricingSectionProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [mousePosition, setMousePosition] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

  return (
    <PricingContext.Provider value={{ isMonthly, setIsMonthly, notes }}>
      <div
        id={id}
        ref={containerRef}
        onMouseMove={reduce ? undefined : (e) => setMousePosition({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setMousePosition({ x: null, y: null })}
        className={cn("relative w-full scroll-mt-16 bg-background py-20 sm:py-24", className)}
      >
        {!reduce && <InteractiveStarfield mousePosition={mousePosition} containerRef={containerRef} />}
        <div className="container-page relative z-10">
          <div className="mx-auto mb-12 max-w-3xl space-y-4 text-center">
            <h2 className="text-4xl font-bold tracking-tighter text-balance text-foreground sm:text-5xl">{title}</h2>
            <p className="text-lg whitespace-pre-line text-muted-foreground">{description}</p>
          </div>
          <PricingToggle options={options} savings={savings} />
          <div className="mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <PricingCard key={plan.name} plan={plan} index={index} />
            ))}
          </div>
        </div>
      </div>
    </PricingContext.Provider>
  );
}

function PricingToggle({ options, savings }: { options: [string, string]; savings: string }) {
  const { isMonthly, setIsMonthly } = useContext(PricingContext);
  const monthlyBtnRef = useRef<HTMLButtonElement>(null);
  const annualBtnRef = useRef<HTMLButtonElement>(null);
  const [pillStyle, setPillStyle] = useState({});

  useEffect(() => {
    const btn = (isMonthly ? monthlyBtnRef : annualBtnRef).current;
    if (btn) setPillStyle({ width: btn.offsetWidth, transform: `translateX(${btn.offsetLeft}px)` });
  }, [isMonthly]);

  const handleToggle = (monthly: boolean) => {
    if (isMonthly === monthly) return;
    setIsMonthly(monthly);

    if (!monthly) {
      const rect = annualBtnRef.current?.getBoundingClientRect();
      if (!rect) return;
      // canvas-confetti needs literal colors, so read the theme tokens here.
      const css = getComputedStyle(document.documentElement);
      const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
        colors: [token("--signal", "#ff5a1f"), token("--foreground", "#111316"), token("--muted-foreground", "#3e4550")],
        ticks: 300,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        disableForReducedMotion: true,
      });
    }
  };

  return (
    <div className="flex justify-center">
      <div className="relative flex w-fit items-center rounded-full bg-muted p-1" role="group" aria-label="Price period">
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full bg-primary p-1"
          style={pillStyle}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
        <button
          ref={monthlyBtnRef}
          onClick={() => handleToggle(true)}
          aria-pressed={isMonthly}
          className={cn(
            "relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-6",
            isMonthly ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {options[0]}
        </button>
        <button
          ref={annualBtnRef}
          onClick={() => handleToggle(false)}
          aria-pressed={!isMonthly}
          className={cn(
            "relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-6",
            !isMonthly ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {options[1]}
          <span className={cn("hidden sm:inline", !isMonthly ? "text-primary-foreground/80" : "")}> {savings}</span>
        </button>
      </div>
    </div>
  );
}

function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const { isMonthly, notes } = useContext(PricingContext);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { y: 50, opacity: 0 }}
      whileInView={{ y: plan.isPopular && isDesktop ? -20 : 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20, delay: index * 0.15 }}
      className={cn(
        "relative flex flex-col rounded-3xl bg-card/80 p-8 backdrop-blur-sm",
        plan.isPopular ? "border-2 border-primary shadow-xl" : "border border-border",
      )}
    >
      {plan.isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5">
            <LucideStar className="h-4 w-4 fill-current text-primary-foreground" />
            <span className="text-sm font-semibold whitespace-nowrap text-primary-foreground">{plan.badge ?? "Most Popular"}</span>
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col text-center">
        <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
        <div className="mt-6 flex items-baseline justify-center gap-x-1">
          {plan.pricePrefix && <span className="mr-1 text-sm font-medium text-muted-foreground">{plan.pricePrefix}</span>}
          <span className="text-5xl font-bold tracking-tight text-foreground">
            <NumberFlow
              value={isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)}
              format={{ style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }}
              className="tabular-nums"
            />
          </span>
          <span className="text-sm leading-6 font-semibold tracking-wide text-muted-foreground">/ {plan.period}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{isMonthly ? notes[0] : notes[1]}</p>

        <ul role="list" className="mt-8 space-y-3 text-left text-sm leading-6 text-muted-foreground">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-x-3">
              <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <Link
            to={plan.href}
            className={cn(
              buttonVariants({ variant: plan.isPopular ? "default" : "outline", size: "lg" }),
              "h-11 w-full rounded-full",
            )}
          >
            {plan.buttonText}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
