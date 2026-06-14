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

/** Short display form: 0x1234…abcd */
export function shortAddress(address) {
    if (!address) return "";
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
