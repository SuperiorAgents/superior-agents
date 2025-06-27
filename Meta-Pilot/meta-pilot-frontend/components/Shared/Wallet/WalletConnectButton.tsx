"use client";

import React, { useState } from "react";
import { Wallet, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import WalletConnectDialog from "./WalletConnectDialog";
import { useWallet } from "@/hooks/use-wallet";

interface WalletConnectButtonProps {
    buttonClass?: string;
    className?: string;
}

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({ buttonClass, className }) => {
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const { address, isConnected, disconnect, formatAddress } = useWallet();

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn("inline-flex", className)}
            >
                {isConnected ? (
                    <Button
                        onClick={() => disconnect()}
                        className={`bg-green-600 text-white font-medium py-3 px-8 ${buttonClass} rounded-full hover:bg-green-700 transition-colors`}
                    >
                        <Check className="mr-2 h-4 w-4" /> {formatAddress(address)}
                    </Button>
                ) : (
                    <Button
                        onClick={() => setShowDialog(true)}
                        className={`bg-blue-600 text-white font-medium py-3 px-8 ${buttonClass} rounded-full hover:bg-blue-700 transition-colors`}
                    >
                        <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                    </Button>
                )}
            </motion.div>

            <WalletConnectDialog
                open={showDialog}
                onOpenChange={setShowDialog}
            />
        </>
    );
};

export default WalletConnectButton;


// "use client";

// import React, { useState } from "react";
// import { Wallet, Check } from "lucide-react";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";

// import { cn } from "@/lib/utils";
// import WalletConnectDialog from "./WalletConnectDialog";


// interface WalletConnectButtonProps {
//     buttonClass?: string;
//     className?: string;
// }


// const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({ buttonClass, className }) => {
//     const [showDialog, setShowDialog] = useState<boolean>(false);
//     const [isConnected, setIsConnected] = useState<boolean>(false);

//     const handleConnect = (): void => {
//         setShowDialog(true);
//     };

//     const handleConnectionSuccess = (): void => {
//         setIsConnected(true);
//     };

//     return (
//         <>
//             <motion.div
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 className={cn("inline-flex", className)}
//             >
//                 {isConnected ? (
//                     <Button
//                         onClick={handleConnect}
//                         className={`bg-blue-600 text-white font-medium py-3 px-8 ${buttonClass} rounded-full hover:bg-blue-700 transition-colors`}
//                     >
//                         <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
//                     </Button>
//                 ) : (
//                     <Button
//                         onClick={handleConnect}
//                         className={`bg-blue-600 text-white font-medium py-3 px-8 ${buttonClass} rounded-full hover:bg-blue-700 transition-colors`}
//                     >
//                         <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
//                     </Button>
//                 )}
//             </motion.div>

//             <WalletConnectDialog
//                 open={showDialog}
//                 onOpenChange={setShowDialog}
//                 onConnectionSuccess={handleConnectionSuccess}
//             />
//         </>
//     );
// };

// export default WalletConnectButton;

