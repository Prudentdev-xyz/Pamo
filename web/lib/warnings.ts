const MESSAGES: Record<string, string> = {
  LOW_LIQUIDITY: "This vault is low on available cash. Withdrawals may have to wait.",
  VAULT_NOT_ACTIVE: "This vault is not working normally right now.",
  VAULT_DATA_UNAVAILABLE: "Live vault data is unavailable. The amounts shown come straight from Arc.",
  GOAL_LOCKED: "This goal is still locked.",
  EXCEEDS_VALUE: "That is more than this pot holds.",
};

/** A plain-English line for a warning code from the server or the Earn Kit. */
export const warningMessage = (code: string) =>
  MESSAGES[code] ?? `The vault reports a risk signal: ${code.toLowerCase().replaceAll("_", " ")}.`;
