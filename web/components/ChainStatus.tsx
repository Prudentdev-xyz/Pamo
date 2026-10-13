import { chain, explorerAddress } from "@/lib/chain";
import { PAMO_SAVINGS } from "@/lib/contract";
import { shortAddress } from "@/lib/format";

/** The one line that names the network Pamo runs on, with the contract to check it against. */
export function ChainStatus({ onDark = false }: { onDark?: boolean }) {
  return (
    <p className={`text-caption ${onDark ? "text-grey-text-dark" : "text-grey-text"}`}>
      Currently on {chain.name}. More chains planned. Contract{" "}
      <a
        href={explorerAddress(PAMO_SAVINGS)}
        target="_blank"
        rel="noreferrer"
        aria-label={`View contract ${shortAddress(PAMO_SAVINGS)} on the explorer`}
        className={`font-semibold whitespace-nowrap tabular-nums underline ${onDark ? "text-green-bright" : "text-green hover:text-green-pressed"}`}
      >
        {shortAddress(PAMO_SAVINGS)}
      </a>
    </p>
  );
}
