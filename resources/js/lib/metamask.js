// MetaMask / SafeSplit Local network helpers.
// chainId 31337 (Hardhat) = 0x7a69 in hex.

export const SAFESPLIT_NETWORK = {
    chainId: "0x7a69", // 31337
    chainName: "SafeSplit Local",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["http://localhost:49545"],
};

export function hasMetaMask() {
    return typeof window !== "undefined" && Boolean(window.ethereum);
}

/** Ask MetaMask to add + switch to the SafeSplit Local network. */
export async function ensureSafeSplitNetwork() {
    if (!hasMetaMask()) throw new Error("METAMASK_MISSING");

    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SAFESPLIT_NETWORK.chainId }],
        });
    } catch (err) {
        // 4902 = chain not added yet → add it.
        if (err?.code === 4902 || /Unrecognized chain/i.test(err?.message ?? "")) {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [SAFESPLIT_NETWORK],
            });
        } else if (err?.code === 4001) {
            throw new Error("USER_REJECTED");
        } else {
            throw err;
        }
    }
}

/** Read the currently-selected account without prompting (null if none / locked). */
export async function getCurrentAccount() {
    if (!hasMetaMask()) return null;
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    return accounts && accounts.length ? accounts[0].toLowerCase() : null;
}

/** Subscribe to account switches. Returns an unsubscribe function. */
export function onAccountsChanged(callback) {
    if (!hasMetaMask()) return () => {};
    const handler = (accounts) =>
        callback(accounts && accounts.length ? accounts[0].toLowerCase() : null);
    window.ethereum.on("accountsChanged", handler);
    return () => window.ethereum.removeListener("accountsChanged", handler);
}

/** Connect: request accounts, ensure network, return the (lowercased) address. */
export async function connectWallet() {
    if (!hasMetaMask()) throw new Error("METAMASK_MISSING");

    let accounts;
    try {
        accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (err) {
        if (err?.code === 4001) throw new Error("USER_REJECTED");
        throw err;
    }

    if (!accounts || accounts.length === 0) throw new Error("NO_ACCOUNTS");

    await ensureSafeSplitNetwork();

    return accounts[0].toLowerCase();
}

/**
 * Sign a message with MetaMask via personal_sign (EIP-191).
 * Returns { signature, address } — address is the account that signed (lowercased).
 */
export async function signMessage(message) {
    if (!hasMetaMask()) throw new Error("METAMASK_MISSING");

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts || accounts.length === 0) throw new Error("NO_ACCOUNTS");
    const from = accounts[0];

    try {
        const signature = await window.ethereum.request({
            method: "personal_sign",
            params: [message, from],
        });
        return { signature, address: from.toLowerCase() };
    } catch (err) {
        if (err?.code === 4001) throw new Error("USER_REJECTED");
        throw err;
    }
}

/** Short display form: 0x1234…abcd */
export function shortAddress(address) {
    if (!address) return "";
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
