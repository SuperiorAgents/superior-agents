"use client";

import React, { useState, useEffect } from "react";
import { Wallet, Shield, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import WalletOption from "./WalletOption";
import { useWalletContext } from "@/components/Providers/wallet-provider";
import { useWallet } from "@/hooks/use-wallet";
import { useRouter } from "next/navigation";

// global.d.ts
declare global {
    interface Window {
        phantom?: any;
    }
}

type ConnectionStatus = "idle" | "connecting" | "success" | "error";

interface WalletConnectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const WalletConnectDialog: React.FC<WalletConnectDialogProps> = ({
    open,
    onOpenChange,
}) => {
    const { connect, isConnected, isConnecting, error } = useWallet();
    const { connectionError } = useWalletContext();
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
    const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState<boolean>(false);
    const [isWalletConnectAvailable, setIsWalletConnectAvailable] = useState<boolean>(true);
    const [isCoinbaseWalletAvailable, setIsCoinbaseWalletAvailable] = useState<boolean>(true);
    const [isPhantomAvailable, setIsPhantomAvailable] = useState<boolean>(true);

    const router = useRouter();

    // Check wallet availability
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Check if MetaMask is available
            setIsMetaMaskAvailable(!!window.ethereum);

            // Check if Phantom is available
            setIsPhantomAvailable(!!window.phantom);
        }
    }, []);



    // Update connection status based on wallet connection state
    useEffect(() => {
        if (isConnecting) {
            setConnectionStatus("connecting");
        } else if (isConnected) {
            setConnectionStatus("success");
        } else if (error || connectionError) {
            setConnectionStatus("error");
        } else {
            setConnectionStatus("idle");
        }
    }, [isConnecting, isConnected, error, connectionError]);

    // Handle wallet connection
    const handleConnect = (walletName: string) => {
        try {
            // Convert wallet display names to connector IDs
            let connectorId;
            switch (walletName) {
                case "MetaMask":
                    connectorId = "metaMaskSDk"; // Try "injected" which is often the standard ID in wagmi
                    if (!isMetaMaskAvailable) {
                        setConnectionStatus("error");
                        return;
                    }
                    break;
                case "WalletConnect":
                    connectorId = "walletConnect";
                    break;
                case "Coinbase Wallet":
                    connectorId = "coinbaseWallet";
                    break;
                case "Phantom":
                    connectorId = "phantom.app";
                    if (!isPhantomAvailable) {
                        setConnectionStatus("error");
                        return;
                    }
                    break;
                default:
                    connectorId = walletName.toLowerCase();
            }

            console.log(`Attempting to connect with ID: ${connectorId}`);
            // Connect using the wallet hook
            connect(connectorId);
        } catch (err) {
            console.error("Connection error:", err);
            setConnectionStatus("error");
        }
    };

    const resetConnection = () => {
        onOpenChange(false);
    };

    const closeAndReset = (openState: boolean) => {
        if (!openState) {
            setTimeout(() => {
                setConnectionStatus("idle");
            }, 300);
        }
        onOpenChange(openState);
    };

    return (
        <Dialog open={open} onOpenChange={closeAndReset}>
            <DialogContent className="sm:max-w-md rounded-xl border-gray-200 dark:border-gray-700/50 bg-white dark:bg-[#060f38] text-slate-900 dark:text-white shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                        Connect Your Wallet
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500 dark:text-gray-400">
                        Connect your wallet to automate DeFi tasks with MetaPilot
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <AnimatePresence mode="wait">
                        {connectionStatus === "idle" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 gap-3"
                            >
                                <WalletOption
                                    name="MetaMask"
                                    icon="/metamask.svg"
                                    onClick={() => handleConnect("MetaMask")}
                                    disabled={!isMetaMaskAvailable}
                                />
                                <WalletOption
                                    name="WalletConnect"
                                    icon="/walletconnect.svg"
                                    onClick={() => handleConnect("WalletConnect")}
                                    disabled={!isWalletConnectAvailable}
                                />
                                <WalletOption
                                    name="Coinbase Wallet"
                                    icon="/coinbase.svg"
                                    onClick={() => handleConnect("Coinbase Wallet")}
                                    disabled={!isCoinbaseWalletAvailable}
                                />
                                <WalletOption
                                    name="Phantom"
                                    icon="/phantom.svg"
                                    onClick={() => handleConnect("Phantom")}
                                    disabled={!isPhantomAvailable}
                                />

                                {!isMetaMaskAvailable && (
                                    <div className="mt-1 text-xs text-amber-500 dark:text-amber-400">
                                        MetaMask extension not detected. <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="underline">Install MetaMask</a>
                                    </div>
                                )}

                                <div className="mt-2 flex items-center justify-center">
                                    <div className="flex items-center text-xs text-slate-500 dark:text-gray-400">
                                        <Shield className="h-3.5 w-3.5 mr-1.5" />
                                        <span>Secured by session keys</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {connectionStatus === "connecting" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-8"
                            >
                                <div className="relative w-12 h-12 mb-4">
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-2 border-transparent 
                                            border-t-blue-500 dark:border-t-blue-500"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <p className="text-center font-medium text-slate-900 dark:text-white">
                                    Connecting to wallet...
                                </p>
                                <p className="text-center text-sm text-slate-500 dark:text-gray-400 mt-2">
                                    Confirm the connection in your wallet extension
                                </p>
                            </motion.div>
                        )}

                        {connectionStatus === "success" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-8"
                            >
                                <motion.div
                                    className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 flex items-center justify-center mb-4"
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                >
                                    <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </motion.div>
                                <p className="text-center font-medium text-lg text-slate-900 dark:text-white mb-1">
                                    Successfully Connected
                                </p>
                                <p className="text-center text-sm text-slate-500 dark:text-gray-400 mb-5">
                                    Your wallet is now connected to MetaPilot
                                </p>
                                <Button
                                    onClick={() => router.push("/dashboard")}
                                    className="bg-gradient-to-r from-blue-600 via-pink-600 to-orange-600 text-white hover:brightness-105 transition-all shadow-md hover:shadow-lg"
                                >
                                    Continue to Dashboard
                                </Button>
                            </motion.div>
                        )}

                        {connectionStatus === "error" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-8"
                            >
                                <motion.div
                                    className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 flex items-center justify-center mb-4"
                                >
                                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </motion.div>
                                <p className="text-center font-medium text-lg text-slate-900 dark:text-white mb-1">
                                    Connection Failed
                                </p>
                                <p className="text-center text-sm text-slate-500 dark:text-gray-400 mb-5">
                                    {!isMetaMaskAvailable && connectionStatus === "error"
                                        ? "MetaMask extension not detected. Please install MetaMask first."
                                        : error?.message || connectionError || "Please try again or use a different wallet"}
                                </p>
                                <Button
                                    onClick={() => setConnectionStatus("idle")}
                                    variant="outline"
                                    className="bg-transparent border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-[#0a1747] transition-colors"
                                >
                                    Try Again
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default WalletConnectDialog;



// "use client";

// import React, { useState } from "react";
// import { Wallet, Shield, Check, AlertCircle } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogDescription,
// } from "@/components/ui/dialog";
// import WalletOption from "./WalletOption";

// type ConnectionStatus = "idle" | "connecting" | "success" | "error";
// type WalletType = "metamask" | "walletconnect" | "coinbase";



// interface WalletConnectDialogProps {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
//     onConnectionSuccess: () => void;
// }



// // Extracted Wallet Connect Dialog Component
// const WalletConnectDialog: React.FC<WalletConnectDialogProps> = ({
//     open,
//     onOpenChange,
//     onConnectionSuccess
// }) => {
//     const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
//     const [isConnecting, setIsConnecting] = useState<boolean>(false);

//     const simulateConnection = (walletType: WalletType): void => {
//         setConnectionStatus("connecting");
//         setIsConnecting(true);

//         setTimeout(() => {
//             // Simulate connection success after 1.5 seconds
//             if (walletType === "metamask") {
//                 setConnectionStatus("success");
//             } else {
//                 setConnectionStatus("error");
//             }
//             setIsConnecting(false);
//         }, 1500);
//     };

//     const resetConnection = (): void => {
//         setConnectionStatus("idle");
//         onOpenChange(false);

//         if (connectionStatus === "success") {
//             onConnectionSuccess();
//         }
//     };

//     const closeAndReset = (openState: boolean) => {
//         if (!openState) {
//             setTimeout(() => {
//                 setConnectionStatus("idle");
//             }, 300); // Reset after dialog close animation
//         }
//         onOpenChange(openState);
//     };

//     return (
//         <Dialog open={open} onOpenChange={closeAndReset}>
//             <DialogContent className="sm:max-w-md rounded-xl border-gray-200 dark:border-gray-700/50 bg-white dark:bg-[#060f38] text-slate-900 dark:text-white shadow-xl">
//                 <DialogHeader>
//                     <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">Connect Your Wallet</DialogTitle>
//                     <DialogDescription className="text-sm text-slate-500 dark:text-gray-400">
//                         Connect your wallet to automate DeFi tasks with MetaPilot
//                     </DialogDescription>
//                 </DialogHeader>

//                 <div className="grid gap-4 py-4">
//                     <AnimatePresence mode="wait">
//                         {connectionStatus === "idle" && (
//                             <motion.div
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 className="grid grid-cols-1 gap-3"
//                             >
//                                 <WalletOption
//                                     name="MetaMask"
//                                     icon="/metamask.svg"
//                                     onClick={() => simulateConnection("metamask")}
//                                 />
//                                 <WalletOption
//                                     name="WalletConnect"
//                                     icon="/walletconnect.svg"
//                                     onClick={() => simulateConnection("walletconnect")}
//                                 />
//                                 <WalletOption
//                                     name="Coinbase Wallet"
//                                     icon="/coinbase.svg"
//                                     onClick={() => simulateConnection("coinbase")}
//                                 />

//                                 <div className="mt-2 flex items-center justify-center">
//                                     <div className="flex items-center text-xs text-slate-500 dark:text-gray-400">
//                                         <Shield className="h-3.5 w-3.5 mr-1.5" />
//                                         <span>Secured by session keys</span>
//                                     </div>
//                                 </div>
//                             </motion.div>
//                         )}

//                         {connectionStatus === "connecting" && (
//                             <motion.div
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 className="flex flex-col items-center justify-center py-8"
//                             >
//                                 <div className="relative w-12 h-12 mb-4">
//                                     <motion.div
//                                         className="absolute inset-0 rounded-full border-2 border-transparent 
//                                             border-t-blue-500 dark:border-t-blue-500"
//                                         animate={{ rotate: 360 }}
//                                         transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
//                                     />
//                                     <div className="absolute inset-0 flex items-center justify-center">
//                                         <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//                                     </div>
//                                 </div>
//                                 <p className="text-center font-medium text-slate-900 dark:text-white">Connecting to wallet...</p>
//                                 <p className="text-center text-sm text-slate-500 dark:text-gray-400 mt-2">
//                                     Confirm the connection in your wallet extension
//                                 </p>
//                             </motion.div>
//                         )}

//                         {connectionStatus === "success" && (
//                             <motion.div
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 className="flex flex-col items-center justify-center py-8"
//                             >
//                                 <motion.div
//                                     className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 flex items-center justify-center mb-4"
//                                     initial={{ scale: 0.8 }}
//                                     animate={{ scale: 1 }}
//                                 >
//                                     <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
//                                 </motion.div>
//                                 <p className="text-center font-medium text-lg text-slate-900 dark:text-white mb-1">
//                                     Successfully Connected
//                                 </p>
//                                 <p className="text-center text-sm text-slate-500 dark:text-gray-400 mb-5">
//                                     Your wallet is now connected to MetaPilot
//                                 </p>
//                                 <Button
//                                     onClick={resetConnection}
//                                     className="bg-gradient-to-r from-blue-600 via-pink-600 to-orange-600 text-white hover:brightness-105 transition-all shadow-md hover:shadow-lg"
//                                 >
//                                     Continue to Dashboard
//                                 </Button>
//                             </motion.div>
//                         )}

//                         {connectionStatus === "error" && (
//                             <motion.div
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 className="flex flex-col items-center justify-center py-8"
//                             >
//                                 <motion.div
//                                     className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 flex items-center justify-center mb-4"
//                                 >
//                                     <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
//                                 </motion.div>
//                                 <p className="text-center font-medium text-lg text-slate-900 dark:text-white mb-1">
//                                     Connection Failed
//                                 </p>
//                                 <p className="text-center text-sm text-slate-500 dark:text-gray-400 mb-5">
//                                     Please try again or use a different wallet
//                                 </p>
//                                 <Button
//                                     onClick={resetConnection}
//                                     variant="outline"
//                                     className="bg-transparent border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-[#0a1747] transition-colors"
//                                 >
//                                     Try Again
//                                 </Button>
//                             </motion.div>
//                         )}
//                     </AnimatePresence>
//                 </div>
//             </DialogContent>
//         </Dialog>
//     );
// };

// export default WalletConnectDialog;