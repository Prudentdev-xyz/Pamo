import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { arc, arcTestnet, chain } from "./chain";

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [injected()],
  transports: { [arc.id]: http(), [arcTestnet.id]: http() },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
