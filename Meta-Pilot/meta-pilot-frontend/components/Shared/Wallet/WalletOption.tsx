"use client";

import React from "react";
import { motion } from "framer-motion";

interface WalletOptionProps {
    name: string;
    icon: string;
    onClick: () => void;
    disabled?: boolean;
}

const WalletOption: React.FC<WalletOptionProps> = ({ name, icon, onClick, disabled = false }) => {
    // Get correct connector ID format for the hook
    const getConnectorId = (walletName: string) => {
        // The actual connector IDs in wagmi may be different than what we expect
        // Let's match the names with wagmi's standard connector IDs
        switch (walletName) {
            case "MetaMask": return "metaMaskSDK"; // Often "injected" in wagmi
            case "WalletConnect": return "walletConnect";
            case "Coinbase Wallet": return "coinbaseWallet";
            case "Phantom": return "app.phantom";
            default: return walletName.toLowerCase().replace(" ", "");
        }
    };

    const handleClick = () => {
        if (!disabled) {
            onClick();
        }
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={handleClick}
            className={`flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700/50 bg-white/90 dark:bg-[#0a1747]/60 hover:bg-gray-50 dark:hover:bg-[#0d1a54]/50 transition-colors ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
            disabled={disabled}
        >
            <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#060f38] border border-gray-200 dark:border-gray-700/50 flex items-center justify-center mr-3">
                    {name === "Phantom" ? (
                        <svg width="20" height="20" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="128" height="128" rx="64" fill="#534BB1" />
                            <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.6612 23 14.8235 41.3057 14.4648 64.0583C14.0889 87.8583 33.3108 108 57.2531 108H61.7487C83.0263 108 107.726 90.1188 113.628 70.1906C114.574 67.2693 112.959 64.9142 110.584 64.9142ZM39.7552 65.9873C39.7552 69.0556 37.4338 71.5493 34.4921 71.5493C31.5503 71.5493 29.2289 69.0556 29.2289 65.9873V54.2413C29.2289 51.173 31.5503 48.6792 34.4921 48.6792C37.4338 48.6792 39.7552 51.173 39.7552 54.2413V65.9873ZM57.2531 65.9873C57.2531 69.0556 54.9317 71.5493 51.9899 71.5493C49.0481 71.5493 46.7267 69.0556 46.7267 65.9873V54.2413C46.7267 51.173 49.0481 48.6792 51.9899 48.6792C54.9317 48.6792 57.2531 51.173 57.2531 54.2413V65.9873Z" fill="white" />
                        </svg>
                    ) :
                        name === "MetaMask" ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21.1782 1L13.3574 7.8L14.9574 3.6L21.1782 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2.82227 1L10.5823 7.8L9.04227 3.6L2.82227 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M18.1823 17.2L15.9023 21.1L20.7023 22.6L22.1023 17.3L18.1823 17.2Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M1.89844 17.3L3.29844 22.6L8.09844 21.1L5.81844 17.2L1.89844 17.3Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7.81641 10.6L6.41641 12.9L11.1164 13.2L10.9164 8L7.81641 10.6Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16.1836 10.6L13.0836 8L12.8836 13.2L17.5836 12.9L16.1836 10.6Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : name === "Coinbase Wallet" ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#1652F0" />
                                <path d="M12 17.0991C14.8077 17.0991 17.0991 14.8077 17.0991 12C17.0991 9.19226 14.8077 6.90088 12 6.90088C9.19226 6.90088 6.90088 9.19226 6.90088 12C6.90088 14.8077 9.19226 17.0991 12 17.0991Z" fill="white" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12Z" fill="#3B99FC" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z" fill="#3B99FC" />
                            </svg>
                        )}
                </div>
                <span className="font-medium text-slate-800 dark:text-white">{name}</span>
            </div>
            <span className="text-sm text-slate-500 dark:text-gray-400">Connect</span>
        </motion.button>
    );
};

export default WalletOption;


// "use client";

// import React from "react";

// import { motion } from "framer-motion";


// interface WalletOptionProps {
//     name: string;
//     icon: string;
//     onClick: () => void;
// }


// // Professional wallet option component
// const WalletOption: React.FC<WalletOptionProps> = ({ name, icon, onClick }) => {
//     return (
//         <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={onClick}
//             className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700/50 bg-white/90 dark:bg-[#0a1747]/60 hover:bg-gray-50 dark:hover:bg-[#0d1a54]/50 transition-colors"
//         >
//             <div className="flex items-center">
//                 <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#060f38] border border-gray-200 dark:border-gray-700/50 flex items-center justify-center mr-3">
//                     {name === "MetaMask" ? (
//                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                             <path d="M21.1782 1L13.3574 7.8L14.9574 3.6L21.1782 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
//                             <path d="M2.82227 1L10.5823 7.8L9.04227 3.6L2.82227 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
//                             <path d="M18.1823 17.2L15.9023 21.1L20.7023 22.6L22.1023 17.3L18.1823 17.2Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
//                             <path d="M1.89844 17.3L3.29844 22.6L8.09844 21.1L5.81844 17.2L1.89844 17.3Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
//                             <path d="M7.81641 10.6L6.41641 12.9L11.1164 13.2L10.9164 8L7.81641 10.6Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
//                             <path d="M16.1836 10.6L13.0836 8L12.8836 13.2L17.5836 12.9L16.1836 10.6Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
//                         </svg>
//                     ) : name === "Coinbase Wallet" ? (
//                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                             <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#1652F0" />
//                             <path d="M12 17.0991C14.8077 17.0991 17.0991 14.8077 17.0991 12C17.0991 9.19226 14.8077 6.90088 12 6.90088C9.19226 6.90088 6.90088 9.19226 6.90088 12C6.90088 14.8077 9.19226 17.0991 12 17.0991Z" fill="white" />
//                         </svg>
//                     ) : (
//                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                             <path d="M6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12Z" fill="#3B99FC" />
//                             <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z" fill="#3B99FC" />
//                         </svg>
//                     )}
//                 </div>
//                 <span className="font-medium text-slate-800 dark:text-white">{name}</span>
//             </div>
//             <span className="text-sm text-slate-500 dark:text-gray-400">Connect</span>
//         </motion.button>
//     );
// };

// export default WalletOption;