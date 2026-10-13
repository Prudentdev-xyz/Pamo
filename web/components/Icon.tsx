import {
  Add,
  ArrowCircleRight,
  ArrowLeft,
  ArrowRight,
  ArrowRight2,
  Calculator,
  Calendar1,
  CloseCircle,
  Copy,
  ExportCurve,
  ExportSquare,
  HambergerMenu,
  Home2,
  ImportCurve,
  InfoCircle,
  Instagram,
  Layer,
  Lock1,
  Logout,
  Sms,
  TickCircle,
  Unlock,
  Wallet2,
  Warning2,
  type Icon as IconsaxIcon,
} from "iconsax-react";

export interface IconProps {
  size?: number;
  /** `Linear` by default, `Bold` for the selected or active state. Pamo uses no other Iconsax variant. */
  variant?: "Linear" | "Bold";
  className?: string;
}

// The one place Pamo takes icons from (Build Guide §7.5). Icons are decoration: the label beside them carries the
// meaning, and an icon-only button names itself with aria-label.
const icon = (Glyph: IconsaxIcon) =>
  function PamoIcon({ size = 20, variant = "Linear", className }: IconProps) {
    return <Glyph size={size} variant={variant} color="currentColor" className={className} aria-hidden="true" />;
  };

export const HomeIcon = icon(Home2);
export const PortfoliosIcon = icon(Layer);
export const CalculatorIcon = icon(Calculator);
export const WalletIcon = icon(Wallet2);
export const MenuIcon = icon(HambergerMenu);
export const CloseIcon = icon(CloseCircle);
export const AddIcon = icon(Add);
export const ArrowCircleIcon = icon(ArrowCircleRight);
export const ChevronRightIcon = icon(ArrowRight2);
export const BackIcon = icon(ArrowLeft);
export const ArrowRightIcon = icon(ArrowRight);
export const CalendarIcon = icon(Calendar1);
/** A Goal Vault: locked until its target or its date. */
export const LockIcon = icon(Lock1);
/** An Anytime Vault: open whenever the owner wants. */
export const UnlockIcon = icon(Unlock);
export const InfoIcon = icon(InfoCircle);
export const WarningIcon = icon(Warning2);
export const CopyIcon = icon(Copy);
export const TickIcon = icon(TickCircle);
export const ExternalIcon = icon(ExportSquare);
export const DisconnectIcon = icon(Logout);
/** Money going into a pot. */
export const SavedIcon = icon(ImportCurve);
/** Money coming out of a pot. */
export const WithdrewIcon = icon(ExportCurve);
export const EmailIcon = icon(Sms);
export const InstagramIcon = icon(Instagram);

// Iconsax has no mark for X, TikTok or GitHub, so these three are the brands' own marks, drawn to the same props.
const brand = (path: string) =>
  function BrandIcon({ size = 20, className }: IconProps) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d={path} />
      </svg>
    );
  };

export const XIcon = brand(
  "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
);
export const TikTokIcon = brand(
  "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
);
export const GitHubIcon = brand(
  "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
);
