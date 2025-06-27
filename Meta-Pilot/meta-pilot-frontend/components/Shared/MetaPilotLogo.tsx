"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface MetaPilotLogoProps {
    className?: string;
    iconOnly?: boolean;
}

const MetaPilotLogo: React.FC<MetaPilotLogoProps> = ({ className = "", iconOnly }) => {
    return (
        <Link href="/" className={`flex items-center ${className}`}>
            <motion.div
                className="relative flex items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 60 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 md:w-10 md:h-10"
                >
                    {/* Background Circle */}
                    <circle cx="30" cy="30" r="30" fill="#040D36" fillOpacity="0.1" />

                    {/* Hexagon Base */}
                    <path
                        d="M30 10L48.6603 20V40L30 50L11.3397 40V20L30 10Z"
                        fill="#3B82F6"
                        fillOpacity="0.1"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                    />

                    {/* Inner Hexagon */}
                    <path
                        d="M30 18L41.3301 24V36L30 42L18.6699 36V24L30 18Z"
                        fill="#3B82F6"
                        fillOpacity="0.2"
                        stroke="#3B82F6"
                        strokeWidth="1"
                    />

                    {/* Centered Icon */}
                    <path
                        d="M30 23L36.1603 26.5V33.5L30 37L23.8397 33.5V26.5L30 23Z"
                        fill="#3B82F6"
                    />

                    {/* Pulsing Data Points */}
                    <circle cx="30" cy="13" r="2" fill="#6366F1" className="animate-pulse" />
                    <circle cx="45" cy="20" r="2" fill="#6366F1" className="animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <circle cx="45" cy="40" r="2" fill="#6366F1" className="animate-pulse" style={{ animationDelay: "0.4s" }} />
                    <circle cx="30" cy="47" r="2" fill="#6366F1" className="animate-pulse" style={{ animationDelay: "0.6s" }} />
                    <circle cx="15" cy="40" r="2" fill="#6366F1" className="animate-pulse" style={{ animationDelay: "0.8s" }} />
                    <circle cx="15" cy="20" r="2" fill="#6366F1" className="animate-pulse" style={{ animationDelay: "1s" }} />

                    {/* Connection Lines */}
                    <line x1="30" y1="13" x2="30" y2="23" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="2 2" />
                    <line x1="45" y1="20" x2="36" y2="26.5" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="2 2" />
                    <line x1="45" y1="40" x2="36" y2="33.5" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="2 2" />
                    <line x1="30" y1="47" x2="30" y2="37" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="2 2" />
                    <line x1="15" y1="40" x2="24" y2="33.5" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="2 2" />
                    <line x1="15" y1="20" x2="24" y2="26.5" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="2 2" />
                </svg>

                {!iconOnly && (
                    <span className="ml-2 text-gray-900 dark:text-white text-xl md:text-2xl font-bold">
                        <span className="text-blue-500">Meta</span>Pilot
                    </span>
                )}

            </motion.div>
        </Link>
    );
};

export default MetaPilotLogo;


