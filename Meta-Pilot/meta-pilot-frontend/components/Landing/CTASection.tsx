"use client";

import { FC, useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import WalletConnectButton from "@/components/Shared/Wallet/WalletConnectButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Zap,
    Clock,
    CheckCircle,
    Rocket
} from "lucide-react";

const MetaPilotCTASection: FC = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Parallax effect on scroll
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    // Track mouse position for interactive background
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (containerRef.current) {
                const { left, top, width, height } = containerRef.current.getBoundingClientRect();
                const x = ((event.clientX - left) / width) - 0.5;
                const y = ((event.clientY - top) / height) - 0.5;
                setMousePosition({ x, y });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // MetaPilot Automation Features
    const automationFeatures = [
        {
            icon: <Rocket className="w-5 h-5" />,
            title: "AI-Powered Automation",
            description: "Let MetaPilot's AI handle your Web3 tasks automatically"
        },
        {
            icon: <Clock className="w-5 h-5" />,
            title: "24/7 Task Execution",
            description: "Never miss opportunities while you're away or offline"
        },
        {
            icon: <Zap className="w-5 h-5" />,
            title: "Gas Optimization",
            description: "Save up to 35% on transaction fees with smart execution"
        }
    ];

    return (
        <section
            ref={containerRef}
            className="py-14 px-4 w-full overflow-hidden relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#050e2d] dark:to-[#071236]"
        >
            {/* Curved corner decorations - brand colors */}
            <div className="absolute top-0 left-0 w-32 h-32 rounded-br-[100px] bg-[#3B82F6]/10 dark:bg-[#4F46E5]/20 -z-5"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 rounded-tl-[100px] bg-[#60A5FA]/10 dark:bg-[#6366F1]/20 -z-5"></div>

            <div className="container mx-auto max-w-5xl relative z-10">
                <motion.div
                    style={{ y }}
                    className="flex flex-col lg:flex-row gap-6 items-center"
                >
                    {/* Left side: MetaPilot Features */}
                    <div className="w-full lg:w-5/12 order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="p-5 lg:p-6 bg-white/80 dark:bg-[#0c1a54]/80 backdrop-blur-sm border-2 border-[#3B82F6]/20 dark:border-[#3B82F6]/20 rounded-[24px] rounded-bl-[5px] rounded-tr-[48px] shadow-lg"
                            style={{
                                borderRadius: "24px 48px 24px 5px",
                                boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.05)"
                            }}
                        >
                            <motion.h3
                                className="text-xl font-bold mb-4 bg-gradient-to-r from-[#3B82F6] to-[#4F46E5] bg-clip-text text-transparent"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                viewport={{ once: true }}
                            >
                                Set it once, automate forever
                            </motion.h3>

                            <div className="space-y-4">
                                {automationFeatures.map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex items-start space-x-3"
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        viewport={{ once: true }}
                                    >
                                        <div className="flex-shrink-0 w-9 h-9 rounded-2xl rounded-bl-sm bg-[#3B82F6]/10 dark:bg-[#162254] flex items-center justify-center text-[#3B82F6] dark:text-[#60A5FA]">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{feature.title}</h4>
                                            <p className="text-slate-600 dark:text-[#9CA3AF] text-xs">{feature.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-5 pl-12">
                                <div className="flex flex-wrap gap-2">
                                    {["DAO Voting", "Rewards Claiming", "Gas Optimization", "Token Trading"].map((task, i) => (
                                        <motion.div
                                            key={i}
                                            className="px-2.5 py-1 bg-[#3B82F6]/10 dark:bg-[#162254] text-xs font-medium text-[#3B82F6] dark:text-[#60A5FA] rounded-xl rounded-bl-sm flex items-center"
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.6 + i * 0.05 }}
                                            viewport={{ once: true }}
                                        >
                                            <CheckCircle className="w-3 h-3 mr-1 text-[#4ADE80]" />
                                            {task}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right side: MetaPilot CTA card */}
                    <div className="w-full lg:w-7/12 order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="relative overflow-hidden rounded-3xl rounded-tr-[70px] rounded-bl-[40px]"
                            style={{
                                borderRadius: "30px 70px 30px 40px",
                                boxShadow: "0 20px 30px -10px rgba(59, 130, 246, 0.3), 0 10px 15px -5px rgba(99, 102, 241, 0.2)"
                            }}
                        >
                            {/* Card background with advanced gradient */}
                            <div className="absolute inset-0 z-0">
                                {/* Curvy clip path */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        clipPath: "polygon(0% 15%, 15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)",
                                    }}
                                >
                                    {/* Primary gradient - UPDATED COLOR SCHEME */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: `linear-gradient(125deg, #4F46E5 0%, #3B82F6 50%, #6366F1 100%)`,
                                            opacity: 0.9
                                        }}
                                    ></div>
                                </div>

                                {/* Mesh pattern overlay */}
                                <div className="absolute inset-0 opacity-10">
                                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <pattern id="dots" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="scale(2)">
                                            <circle cx="2" cy="2" r="1" fill="white"></circle>
                                        </pattern>
                                        <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)"></rect>
                                    </svg>
                                </div>

                                {/* Corner decorations for added style */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full"></div>

                                {/* Interactive subtle shine effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                                    style={{
                                        backgroundPosition: `${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%`
                                    }}
                                ></motion.div>
                            </div>

                            <div className="relative z-10 p-6 md:p-8 text-white text-center">
                                <motion.h2
                                    className="text-2xl md:text-3xl font-bold mb-4 text-white drop-shadow-sm"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    viewport={{ once: true }}
                                >
                                    Let MetaPilot Automate Your Web3 Life
                                </motion.h2>

                                <motion.p
                                    className="mb-6 text-white/90 text-base max-w-2xl mx-auto"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    Connect your wallet to MetaPilot and never miss another DAO vote, reward claim,
                                    or trading opportunity. AI-powered automation for all your Web3 tasks.
                                </motion.p>

                                <motion.div
                                    className="flex flex-col sm:flex-row items-center justify-center mb-4  gap-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    viewport={{ once: true }}
                                >
                                    {/* UPDATED BUTTON STYLING with CURVY SHAPES */}
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <WalletConnectButton buttonClass="px-6 py-5 w-full md:w-auto !rounded-xl !rounded-tr-sm" />
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <Link href="/dashboard">
                                            <Button
                                                variant="outline"
                                                className="border-white text-white bg-white/10 hover:bg-white/20 font-medium px-6 h-10 min-w-[160px] rounded-xl rounded-bl-sm"
                                            >
                                                See What's Possible
                                            </Button>
                                        </Link>
                                    </motion.div>
                                </motion.div>

                                <motion.div
                                    className="pt-5 border-t border-white/20 flex flex-wrap justify-center gap-6 text-white/80"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]"></div>
                                        <span className="text-sm">10,000+ Automated Tasks Daily</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]"></div>
                                        <span className="text-sm">30% Average Gas Savings</span>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default MetaPilotCTASection;