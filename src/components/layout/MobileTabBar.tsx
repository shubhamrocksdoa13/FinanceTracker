"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "Home",
    icon: (
      <path d="M4 11.5 12 4l8 7.5M6 9.5V20h12V9.5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    href: "/transactions",
    label: "Activity",
    icon: (
      <>
        <path d="M7 4h10a1 1 0 0 1 1 1v15l-3-2-2 2-2-2-2 2-3-2V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
        <path d="M9 9h6M9 13h6" strokeLinecap="round" />
      </>
    ),
  },
  {
    href: "/net-worth",
    label: "Net Worth",
    icon: (
      <path
        d="M4 17 9.5 11l3.5 3.5L20 6.5M20 6.5h-5M20 6.5v5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3.2" />
        <path
          d="M12 3v3.2M12 17.8V21M21 12h-3.2M6.2 12H3M18.4 5.6l-2.3 2.3M7.9 16.1l-2.3 2.3M18.4 18.4l-2.3-2.3M7.9 7.9 5.6 5.6"
          strokeLinecap="round"
        />
      </>
    ),
  },
];

/** Bottom tab bar, mobile only — the top nav takes over from `sm` up. */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    // Positioning/border/background are inline styles rather than Tailwind
    // utilities (fixed, inset-x-0, bottom-0, border-t, bg-background):
    // brand-new utility classes have been unreliable in this Next 16
    // Turbopack dev setup — first-use classes sometimes don't generate even
    // across a full `.next` cache clear + restart (see also NetWorthChart's
    // inline chart height, same root cause). Classes already exercised
    // elsewhere in the app (flex, sm:hidden, text-xs, text-foreground/50,
    // text-emerald-600) are unaffected and kept as-is.
    <nav
      className="flex sm:hidden"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        borderTop: "1px solid var(--chart-grid)",
        background: "var(--background)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
              active ? "text-emerald-600" : "text-foreground/50"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              {tab.icon}
            </svg>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
