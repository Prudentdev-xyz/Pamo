import {
  Add,
  ArrowCircleRight,
  ArrowLeft,
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
  Layer,
  Lock1,
  Logout,
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
