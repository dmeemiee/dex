"use client";

import { useState, useEffect } from "react";
import {
  toEther,
  toWei,
  useAddress,
  useBalance,
  useContract,
  useContractRead,
  useContractWrite,
  useSDK,
  useTokenBalance
} from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { NextPage } from "next";
import SwapInput from "../components/SwapInput";
import NetworkSelector from "../components/NetworkSelector";

const networks = [
  { id: "core", name: "CORE", nativeToken: "CORE" },
  { id: "xdc", name: "XDC", nativeToken: "XDC" },
  { id: "tlos", name: "TLOS", nativeToken: "TLOS" },
  { id: "base", name: "BASE", nativeToken: "ETH" },
];

const contractAddresses = {
  core: {
    TOKEN_CONTRACT: "0x743b30c4645612a3a22AaE2b19A051b478B60cCa",
    DEX_CONTRACT: "0x5f16053137B88cAB27315653936c3Ff439d7d8B5",
  },
  xdc: {
    TOKEN_CONTRACT: "0x32bb1c8Be72bB0e826d02d4905eC09F3DAdD5587",
    DEX_CONTRACT: "0x5f16053137B88cAB27315653936c3Ff439d7d8B5",
  },
  tlos: {
    TOKEN_CONTRACT: "0x349f961500C274e179a298618198Ea8f88513bfc",
    DEX_CONTRACT: "0x5f16053137B88cAB27315653936c3Ff439d7d8B5",
  },
  base: {
    TOKEN_CONTRACT: "0x54265cCd283Ad1e3F462eCf93BcbA5Ecc42c56Bd",
    DEX_CONTRACT: "0x5f16053137B88cAB27315653936c3Ff439d7d8B5",
  },
};

const Home: NextPage = () => {
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const TOKEN_CONTRACT = contractAddresses[selectedNetwork?.id]?.TOKEN_CONTRACT;
  const DEX_CONTRACT = contractAddresses[selectedNetwork?.id]?.DEX_CONTRACT;

  const sdk = useSDK();
  const address = useAddress();
  const { contract: tokenContract } = useContract(TOKEN_CONTRACT);
  const { contract: dexContract } = useContract(DEX_CONTRACT);
  const { data: symbol } = useContractRead(tokenContract, "symbol");
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  const { data: nativeBalance } = useBalance();
  const { data: contractTokenBalance } = useTokenBalance(tokenContract, DEX_CONTRACT);

  const [contractBalance, setContractBalance] = useState<string>("0");
  const [nativeValue, setNativeValue] = useState<string>("0");
  const [tokenValue, setTokenValue] = useState<string>("0");
  const [burnAmount, setBurnAmount] = useState<string>("0");
  const [currentFrom, setCurrentFrom] = useState<string>("native");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { mutateAsync: swapNativeToken } = useContractWrite(dexContract, "swapEthToToken");
  const { mutateAsync: swapTokenToNative } = useContractWrite(dexContract, "swapTokenToEth");
  const { mutateAsync: approveTokenSpending } = useContractWrite(tokenContract, "approve");
  const { mutateAsync: burnTokens } = useContractWrite(tokenContract, "burn");

  const { data: amountToGet } = useContractRead(
    dexContract,
    "getAmountOfTokens",
    currentFrom === "native"
      ? [toWei(nativeValue || "0"), toWei(contractBalance || "0"), contractTokenBalance?.value || "0"]
      : [toWei(tokenValue || "0"), contractTokenBalance?.value || "0", toWei(contractBalance || "0")]
  );

  const fetchContractBalance = async () => {
    try {
      const balance = await sdk?.getBalance(DEX_CONTRACT);
      setContractBalance(balance?.displayValue || "0");
    } catch (error) {
      console.error(error);
    }
  };

  const executeSwap = async () => {
    setIsLoading(true);
    try {
      if (currentFrom === "native") {
        await swapNativeToken({
          overrides: {
            value: toWei(nativeValue || "0"),
          },
        });
      } else {
        await approveTokenSpending({
          args: [DEX_CONTRACT, toWei(tokenValue || "0")],
        });
        await swapTokenToNative({
          args: [toWei(tokenValue || "0")],
        });
      }
      alert("Swap executed successfully");
    } catch (error) {
      console.error(error);
      alert("An error occurred while trying to execute the swap");
    } finally {
      setIsLoading(false);
    }
  };

  const executeBurn = async () => {
    setIsLoading(true);
    try {
      await burnTokens({
        args: [toWei(burnAmount || "0")],
      });
      alert("Tokens burned successfully");
      setBurnAmount("0");
    } catch (error) {
      console.error(error);
      alert("An error occurred while trying to burn tokens");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContractBalance();
    const interval = setInterval(fetchContractBalance, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!amountToGet) return;
    if (currentFrom === "native") {
      setTokenValue(toEther(amountToGet));
    } else {
      setNativeValue(toEther(amountToGet));
    }
  }, [amountToGet]);

  return (
    <main className={styles.main} style={{ backgroundColor: "#00B4D8" }}>
      <div className={styles.container}>
        <div className={styles.swapContainer}>
          <NetworkSelector
            networks={networks}
            selectedNetwork={selectedNetwork}
            onSelectNetwork={setSelectedNetwork}
          />
          <SwapInput
            current={currentFrom}
            type="native"
            max={nativeBalance?.displayValue}
            value={nativeValue}
            setValue={setNativeValue}
            tokenSymbol={selectedNetwork?.nativeToken}
            tokenBalance={nativeBalance?.displayValue}
          />
          <button
            onClick={() => setCurrentFrom(currentFrom === "native" ? "token" : "native")}
            className={styles.toggleButton}
          >
            {currentFrom === "native" ? "↓" : "↑"}
          </button>
          <SwapInput
            current={currentFrom}
            type="token"
            max={tokenBalance?.displayValue}
            value={tokenValue}
            setValue={setTokenValue}
            tokenSymbol={symbol as string}
            tokenBalance={tokenBalance?.displayValue}
          />
          {address ? (
            <div className={styles.swapButtonContainer}>
              <button
                onClick={executeSwap}
                disabled={isLoading}
                className={styles.swapButton}
                style={{ backgroundColor: "#00B4D8" }}
              >
                {isLoading ? "Swapping..." : "Swap"}
              </button>
            </div>
          ) : (
            <p className={styles.connectWalletMessage}>Connect wallet to exchange.</p>
          )}
          <div className={styles.burnContainer}>
            <input
              type="number"
              placeholder="Amount to burn"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              className={styles.burnInput}
            />
            <button
              onClick={executeBurn}
              disabled={isLoading}
              className={styles.burnButton}
              style={{ backgroundColor: "#00B4D8" }}
            >
              {isLoading ? "Burning..." : "Burn Tokens"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
