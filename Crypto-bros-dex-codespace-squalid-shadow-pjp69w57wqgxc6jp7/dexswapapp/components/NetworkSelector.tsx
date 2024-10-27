import React from "react";
import styles from "../styles/Home.module.css";

type Network = {
  id: string;
  name: string;
  nativeToken: string;
};

type Props = {
  networks: Network[];
  selectedNetwork: Network;
  onSelectNetwork: (network: Network) => void;
};

export default function NetworkSelector({
  networks,
  selectedNetwork,
  onSelectNetwork,
}: Props) {
  return (
    <div className={styles.networkSelector}>
      <select
        value={selectedNetwork.id}
        onChange={(e) => {
          const network = networks.find((n) => n.id === e.target.value);
          if (network) onSelectNetwork(network);
        }}
        className={styles.networkSelect}
      >
        {networks.map((network) => (
          <option key={network.id} value={network.id}>
            {network.name}
          </option>
        ))}
      </select>
    </div>
  );
}