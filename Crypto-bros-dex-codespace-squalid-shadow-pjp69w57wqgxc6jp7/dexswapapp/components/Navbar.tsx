import { ConnectWallet } from "@thirdweb-dev/react";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <h1 className={styles.title}>CRYPTOBROTHERS Aggregator</h1>
            <ConnectWallet />
        </nav>
    );
}