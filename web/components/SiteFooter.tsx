import { ChainStatus } from "./ChainStatus";
import { Logo } from "./Logo";

const REPO = "https://github.com/Prudentdev-xyz/Pamo";

/** The black footer on the pages that need no wallet. The one place they name the network Pamo runs on. */
export function SiteFooter() {
  return (
    <footer className="bg-black px-5 pt-8 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] text-white lg:p-10">
      <div className="mx-auto flex max-w-280 flex-wrap items-center justify-between gap-5">
        <Logo className="h-8 w-auto" />
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          <ChainStatus onDark />
          <a href={REPO} target="_blank" rel="noreferrer" className="text-caption font-semibold text-white underline">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
