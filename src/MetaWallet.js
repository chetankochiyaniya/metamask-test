import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";

import { WagmiConfig } from "wagmi";
import { arbitrum, mainnet } from "wagmi/chains";
import App from "./App";

// 1. Get projectId
const projectId = "3f1a02ea820d084411cc10f5f4dcda59";

// 2. Create wagmiConfig
const metadata = {
  name: "Winyar",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [mainnet, arbitrum];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains });

export default function MetaWallet() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <App />
    </WagmiConfig>
  );
}
