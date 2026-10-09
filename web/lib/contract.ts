import { parseAbi, type Address } from "viem";

export const PAMO_SAVINGS = process.env.NEXT_PUBLIC_PAMO_SAVINGS_ADDRESS as Address;

/** USDC through its ERC-20 interface (6 decimals). Same address on Arc mainnet and testnet. */
export const USDC: Address = "0x3600000000000000000000000000000000000000";
export const USDC_DECIMALS = 6;

export const pamoSavingsAbi = parseAbi([
  "struct Pot { address owner; uint8 kind; uint8 tier; bool unlocked; uint64 unlockAt; address vault; uint256 shares; uint256 principal; uint256 target; }",
  "struct PotView { uint256 id; Pot pot; uint256 value; bool unlocked; }",
  "function getPots(address owner_) view returns (PotView[])",
  "function getPot(uint256 id) view returns (Pot)",
  "function potValue(uint256 id) view returns (uint256)",
  "function isUnlocked(uint256 id) view returns (bool)",
  "function vaultFor(uint8 tier) view returns (address)",
  "function openPot(uint8 kind, uint8 tier, uint256 target, uint64 unlockAt, string name, uint256 assets) returns (uint256 id)",
  "function deposit(uint256 id, uint256 assets)",
  "function withdraw(uint256 id, uint256 assets)",
  "function withdrawAll(uint256 id)",
  "event PotOpened(uint256 indexed id, address indexed owner, uint8 kind, uint8 tier, address vault, uint256 target, uint64 unlockAt, string name)",
  "event Deposited(uint256 indexed id, address indexed owner, uint256 assets, uint256 shares)",
  "event Withdrawn(uint256 indexed id, address indexed owner, uint256 assets, uint256 shares)",
  "error NotPotOwner()",
  "error ZeroAmount()",
  "error NameTooLong()",
  "error TierNotSet()",
  "error InvalidGoal()",
  "error GoalLocked()",
  "error AmountExceedsValue()",
  "error NothingToWithdraw()",
  "error EnforcedPause()",
]);

export const erc20Abi = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]);

export const KINDS = ["Anytime", "Goal"] as const;
export const TIERS = ["Calm", "Steady", "Bold"] as const;
export const TIER_KEYS = ["calm", "steady", "bold"] as const;

export const KIND_ANYTIME = 0;
export const KIND_GOAL = 1;

/** Shown until the backend supplies the name the owner chose. */
export const fallbackPotName = (kind: number, id: bigint) =>
  `${kind === KIND_GOAL ? "Goal Vault" : "Anytime Vault"} #${id}`;
