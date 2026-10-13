import Link from "next/link";
import { ChainStatus } from "./ChainStatus";
import { EmailIcon, GitHubIcon, InstagramIcon, TikTokIcon, XIcon } from "./Icon";
import { Logo } from "./Logo";

const EMAIL = "usepamosafe@gmail.com";

const SOCIALS = [
  { href: "https://www.instagram.com/usepamosafe/", label: "Pamo on Instagram", Glyph: InstagramIcon },
  { href: "https://x.com/pamosafe", label: "Pamo on X", Glyph: XIcon },
  { href: "https://www.tiktok.com/@pamosafe", label: "Pamo on TikTok", Glyph: TikTokIcon },
  { href: "https://github.com/Prudentdev-xyz/Pamo", label: "Pamo on GitHub", Glyph: GitHubIcon },
];

/** The black footer on the pages that need no wallet. The one place they name the network Pamo runs on. */
export function SiteFooter() {
  return (
    <footer className="bg-black px-5 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] text-white lg:px-10 lg:pt-14 lg:pb-10">
      <div className="mx-auto grid max-w-280 gap-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <Link href="/" aria-label="Pamo home" className="text-white">
            <Logo className="h-8 w-auto" />
          </Link>
          <ul className="flex flex-wrap gap-2.5">
            {SOCIALS.map(({ href, label, Glyph }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex size-11 items-center justify-center rounded-full border border-white/20 text-white transition-[background-color,border-color,transform] duration-150 ease-out hover:border-white hover:bg-white/10 active:scale-[0.97]"
                >
                  <Glyph size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-7 gap-y-4 border-t border-white/15 pt-6">
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center gap-2 text-label font-semibold text-white underline-offset-[3px] hover:underline"
          >
            <EmailIcon size={18} />
            {EMAIL}
          </a>
          <ChainStatus onDark />
        </div>
      </div>
    </footer>
  );
}
