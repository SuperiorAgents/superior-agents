"use client";

import { useWalletContext } from "@/components/Providers/wallet-provider";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";

export function useWallet() {
    const { address, isConnected, status } = useAccount();
    const { connectors, connect, isPending, error } = useConnect();
    const { disconnect } = useDisconnect();
    const { isConnecting, setIsConnecting, setConnectionError } = useWalletContext();
    const { data: balance } = useBalance({
        address,
    });

    // Format address for display
    const formatAddress = (addr?: string) => {
        if (!addr) return "";
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // Handle connect with specific connector
    const handleConnect = async (connectorId: string) => {
        setIsConnecting(true);
        setConnectionError(null);

        try {
            // Debug the available connectors
            console.log("Available connectors:", connectors.map(c => c.id));

            // Find the connector by ID - normalize connector IDs 
            const normalizedId = connectorId.toLowerCase();
            const connector = connectors.find(c =>
                c.id.toLowerCase() === normalizedId ||
                c.id.toLowerCase().replace(/\s+/g, '') === normalizedId.replace(/\s+/g, '')
            );

            if (!connector) {
                throw new Error(`Connector ${connectorId} not found. Available connectors: ${connectors.map(c => c.id).join(', ')}`);
            }

            // Check if MetaMask is installed when using MetaMask connector
            if (normalizedId.includes("metamask") &&
                typeof window !== "undefined" &&
                !window.ethereum) {
                throw new Error("MetaMask extension not detected. Please install MetaMask.");
            }

            // Connect using the identified connector
            await connect({ connector });
        } catch (err) {
            console.error("Failed to connect wallet:", err);
            setConnectionError(err instanceof Error ? err.message : "Connection failed");
        } finally {
            setIsConnecting(false);
        }
    };

    // Handle disconnect
    const handleDisconnect = () => {
        disconnect();
    };

    return {
        address,
        isConnected,
        status,
        isConnecting,
        isPending: isPending || isConnecting,
        balance,
        formatAddress,
        connect: handleConnect,
        disconnect: handleDisconnect,
        error,
    };
}

// "use client";

// import { useWalletContext } from "@/components/Providers/wallet-provider";
// import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";

// export function useWallet() {
//     const { address, isConnected, status } = useAccount();
//     const { connectors, connect, isPending } = useConnect();
//     const { disconnect } = useDisconnect();
//     const { isConnecting, setIsConnecting } = useWalletContext();
//     const { data: balance } = useBalance({
//         address,
//     });

//     // Format address for display
//     const formatAddress = (addr?: string) => {
//         if (!addr) return "";
//         return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
//     };

//     // Handle connect
//     const handleConnect = async () => {
//         setIsConnecting(true);
//         try {
//             connect({ connector: connectors[0] });
//         } catch (error) {
//             console.error("Failed to connect wallet:", error);
//         } finally {
//             setIsConnecting(false);
//         }
//     };

//     // Handle disconnect
//     const handleDisconnect = () => {
//         disconnect();
//     };

//     return {
//         address,
//         isConnected,
//         status,
//         isConnecting,
//         isPending: isPending || isConnecting,
//         balance,
//         formatAddress,
//         connect: handleConnect,
//         disconnect: handleDisconnect,
//     };
// }