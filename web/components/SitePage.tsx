import type { ReactNode } from "react";
import { PageRise } from "./PageRise";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

/** The frame of a page that needs no wallet: the floating nav, a large heading with its lead, and the black footer. */
export function SitePage({
  title,
  lead,
  cta,
  children,
}: {
  title: string;
  lead: string;
  cta?: "primary" | "outline";
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-black px-5 py-3 text-label font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteNav cta={cta} />
      <main id="main" className="flex-1 px-5 pt-8 pb-14 lg:px-10 lg:pt-14 lg:pb-24">
        <div className="mx-auto grid max-w-280 grid-cols-[minmax(0,1fr)] gap-8 lg:gap-12">
          <PageRise className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
            <h1 className="text-display font-bold tracking-[-0.03em] lg:text-balance">{title}</h1>
            <p className="max-w-105 text-body text-grey-text">{lead}</p>
          </PageRise>
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
