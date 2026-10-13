import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100";

// One green button per screen: `primary` is the main action, everything else is `outline` or a plain link.
const variants: Record<Variant, string> = {
  primary: "bg-green text-white hover:bg-green-pressed disabled:bg-grey-line disabled:text-grey-muted",
  outline:
    "border-[1.5px] border-black bg-white text-black hover:bg-grey-surface disabled:border-grey-line disabled:text-grey-muted",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-6 text-label",
  lg: "h-13 px-7 text-body",
};

export const buttonClass = (variant: Variant = "primary", size: Size = "md", className = "") =>
  `${base} ${variants[variant]} ${sizes[size]} ${className}`;

interface Common {
  /** A transaction is on its way: the button cannot be pressed but keeps its colour, so it does not look switched off. */
  pending?: boolean;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

const pendingClass = "disabled:bg-green! disabled:text-white! disabled:cursor-progress";

export function Button({ variant, size, className = "", pending, children, ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      disabled={rest.disabled || pending}
      aria-busy={pending || undefined}
      className={buttonClass(variant, size, `${className} ${pending ? pendingClass : ""}`)}
    >
      {children}
    </button>
  );
}

/** A link that looks like a button, for actions that change the page. */
export function ButtonLink({ href, variant, size, className, children }: Omit<Common, "pending"> & { href: string }) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}
