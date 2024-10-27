import type { AppProps } from "next/app";
import { ThirdwebProvider, ChainId } from "@thirdweb-dev/react";
import "../styles/globals.css";
import Navbar from "../components/Navbar";

const activeChains = [
  {
    chainId: 1116, // CORE
    rpc: ["https://rpc.coredao.org"],
  },
  {
    chainId: 50, // XDC
    rpc: ["https://rpc.xinfin.network"],
  },
  {
    chainId: 40, // TELOS
    rpc: ["https://mainnet.telos.net/evm"],
  },
  {
    chainId: 8453, // BASE
    rpc: ["https://mainnet.base.org"],
  },
];

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
      supportedChains={activeChains}
    >
      <Navbar />
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;