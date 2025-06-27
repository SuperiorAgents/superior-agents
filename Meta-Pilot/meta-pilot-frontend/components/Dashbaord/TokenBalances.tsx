"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Wallet,
    RefreshCcw,
    Plus,
    ChevronRight,
    ExternalLink,
    Zap,
    TrendingUp,
    TrendingDown,
    MoreVertical,
    ScanLine,
    Eye,
    EyeOff,
    ArrowRightLeft,
    History,
    Filter,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useWallet } from "@/hooks/use-wallet";

// Token data interface
interface Token {
    id: string;
    symbol: string;
    name: string;
    logo: string;
    balance: number;
    balanceUsd: number;
    price: number;
    priceChange24h: number;
    network: string;
    isStaked?: boolean;
    stakedAmount?: number;
    stakedAmountUsd?: number;
    apy?: number;
}

// Wallet summary interface
interface WalletSummary {
    totalBalanceUsd: number | bigint;
    totalChange24h: number;
    totalChangePercentage24h: number;
    tokens: Token[];
}

interface TokenBalancesProps {
    compact?: boolean;
    showSearch?: boolean;
    showFilters?: boolean;
    walletAddress?: string;
    className?: string;
    limit?: number;
}



const TokenBalances: React.FC<TokenBalancesProps> = ({
    compact = false,
    showSearch = false,
    showFilters = false,
    walletAddress,
    className,
    limit,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showBalances, setShowBalances] = useState(true);
    const { balance } = useWallet()

    const mockWalletData: WalletSummary = {
        totalBalanceUsd: balance?.value ?? 0,
        totalChange24h: -419.80,
        totalChangePercentage24h: -3.24,
        tokens: [
            {
                id: "eth",
                symbol: "ETH",
                name: "Ethereum",
                logo: "/icons/ethereum.svg",
                balance: 2.45,
                balanceUsd: 5230.25,
                price: 2134.8,
                priceChange24h: -2.8,
                network: "Ethereum",
            },
            {
                id: "usdc",
                symbol: "USDC",
                name: "USD Coin",
                logo: "/icons/usdc.svg",
                balance: 5000,
                balanceUsd: 5000,
                price: 1,
                priceChange24h: 0,
                network: "Ethereum",
            },
            {
                id: "aave",
                symbol: "AAVE",
                name: "Aave",
                logo: "/icons/aave.svg",
                balance: 18.2,
                balanceUsd: 1456,
                price: 80,
                priceChange24h: -5.2,
                network: "Ethereum",
                isStaked: true,
                stakedAmount: 12.5,
                stakedAmountUsd: 1000,
                apy: 3.8,
            },
            {
                id: "link",
                symbol: "LINK",
                name: "Chainlink",
                logo: "/icons/chainlink.svg",
                balance: 120,
                balanceUsd: 840,
                price: 7,
                priceChange24h: 1.2,
                network: "Ethereum",
            },
            {
                id: "matic",
                symbol: "MATIC",
                name: "Polygon",
                logo: "/icons/polygon.svg",
                balance: 800,
                balanceUsd: 560,
                price: 0.7,
                priceChange24h: -1.5,
                network: "Ethereum",
            },
            {
                id: "uni",
                symbol: "UNI",
                name: "Uniswap",
                logo: "/icons/uniswap.svg",
                balance: 50,
                balanceUsd: 275,
                price: 5.5,
                priceChange24h: -4.3,
                network: "Ethereum",
            },
        ],
    };

    const [walletData, setWalletData] = useState<WalletSummary>(mockWalletData);


    // Filter tokens by search query
    const filteredTokens = walletData.tokens.filter(token =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Limit tokens to display
    const displayedTokens = limit ? filteredTokens.slice(0, limit) : filteredTokens;

    // Refresh wallet data
    const refreshWallet = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setWalletData({
                ...walletData,
                totalBalanceUsd: BigInt(walletData.totalBalanceUsd) + (Math.random() > 0.5 ? 50n : -50n),
            });
            setIsLoading(false);
        }, 1000);
    };

    // Format currency
    const formatCurrency = (value: number | bigint) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    // Compact display for small screens
    if (compact) {
        return (
            <Card className={className}>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Wallet
                        </CardTitle>
                        <Button
                            size="icon"
                            variant="ghost"
                            disabled={isLoading}
                            onClick={refreshWallet}
                            className="h-7 w-7"
                        >
                            <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        </Button>
                    </div>
                    <CardDescription>
                        Connected wallet summary
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-0">
                    <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Balance</p>
                            <div className="flex items-center gap-2">
                                <p className={cn(
                                    "text-xl font-bold",
                                    showBalances ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
                                )}>
                                    {showBalances ? formatCurrency(walletData.totalBalanceUsd) : "••••••"}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowBalances(!showBalances)}
                                    className="h-6 w-6"
                                >
                                    {showBalances ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500 dark:text-slate-400">24h Change</p>
                            <p className={cn(
                                "text-sm font-medium",
                                walletData.totalChange24h >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}>
                                {walletData.totalChange24h >= 0 ? "+" : ""}{formatCurrency(walletData.totalChange24h)} ({walletData.totalChangePercentage24h >= 0 ? "+" : ""}{walletData.totalChangePercentage24h.toFixed(2)}%)
                            </p>
                        </div>
                    </div>

                    {/* Top 3 tokens */}
                    <div className="space-y-3 py-3">
                        {displayedTokens.slice(0, 3).map((token) => (
                            <div key={token.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={token.logo} alt={token.symbol} />
                                        <AvatarFallback className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                                            {token.symbol.substring(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{token.symbol}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{token.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={cn(
                                        "font-medium",
                                        showBalances ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
                                    )}>
                                        {showBalances ? token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "•••"} {token.symbol}
                                    </p>
                                    <p className={cn(
                                        "text-xs",
                                        showBalances ? "text-slate-500 dark:text-slate-400" : "text-slate-400 dark:text-slate-500"
                                    )}>
                                        {showBalances ? formatCurrency(token.balanceUsd) : "••••••"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="pt-2">
                    <Button asChild variant="ghost" className="w-full justify-center">
                        <Link href="/dashboard/wallet">
                            View All Assets
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    // Full component
    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Wallet Overview
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {walletAddress && (
                            <p className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">
                                {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                            </p>
                        )}
                        <Button
                            size="icon"
                            variant="ghost"
                            disabled={isLoading}
                            onClick={refreshWallet}
                            className="h-7 w-7"
                        >
                            <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem className="flex items-center gap-2">
                                    <ScanLine className="h-4 w-4" />
                                    <span>Scan for Tokens</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                    <History className="h-4 w-4" />
                                    <span>Transaction History</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    <span>View on Etherscan</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <CardDescription>
                    Your connected wallet balances
                </CardDescription>
            </CardHeader>

            {/* Total balance & filters */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Balance</p>
                        <div className="flex items-center gap-2">
                            <h2 className={cn(
                                "text-2xl font-bold",
                                showBalances ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
                            )}>
                                {showBalances ? formatCurrency(walletData.totalBalanceUsd) : "••••••••"}
                            </h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowBalances(!showBalances)}
                                className="h-6 w-6"
                            >
                                {showBalances ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                            <p className={cn(
                                "text-sm font-medium",
                                walletData.totalChange24h >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}>
                                {walletData.totalChange24h >= 0 ? "+" : ""}{formatCurrency(walletData.totalChange24h)} ({walletData.totalChangePercentage24h >= 0 ? "+" : ""}{walletData.totalChangePercentage24h.toFixed(2)}%)
                            </p>
                        </div>
                    </div>

                    {/* Search and filters */}
                    {(showSearch || showFilters) && (
                        <div className="flex items-center gap-2">
                            {showSearch && (
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search tokens"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-9 w-full md:w-[180px]"
                                    />
                                </div>
                            )}

                            {showFilters && (
                                <Button variant="outline" size="sm" className="h-9 gap-1">
                                    <Filter className="h-4 w-4" />
                                    <span>Filter</span>
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <CardContent className="p-0">
                {/* Token list */}
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {displayedTokens.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-slate-500 dark:text-slate-400">No tokens found</p>
                        </div>
                    ) : (
                        displayedTokens.map((token) => (
                            <motion.div
                                key={token.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={token.logo} alt={token.symbol} />
                                            <AvatarFallback className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                                                {token.symbol.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-slate-900 dark:text-slate-100">{token.name}</p>
                                                <Badge variant="outline" className="text-[10px] h-[18px] px-1 border-slate-200 dark:border-slate-700">
                                                    {token.network}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{token.symbol}</p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className={cn(
                                            "font-medium text-slate-900 dark:text-slate-100",
                                            !showBalances && "text-slate-400 dark:text-slate-500"
                                        )}>
                                            {showBalances ? token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "•••••"} {token.symbol}
                                        </p>
                                        <div className="flex items-center justify-end gap-2">
                                            <p className={cn(
                                                "text-xs",
                                                showBalances ? "text-slate-500 dark:text-slate-400" : "text-slate-400 dark:text-slate-500"
                                            )}>
                                                {showBalances ? formatCurrency(token.balanceUsd) : "••••••"}
                                            </p>
                                            <p className={cn(
                                                "text-xs flex items-center",
                                                token.priceChange24h >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                            )}>
                                                {token.priceChange24h >= 0 ? (
                                                    <TrendingUp className="h-3 w-3 mr-0.5" />
                                                ) : (
                                                    <TrendingDown className="h-3 w-3 mr-0.5" />
                                                )}
                                                {token.priceChange24h >= 0 ? "+" : ""}{token.priceChange24h.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Staked info if available */}
                                {token.isStaked && token.stakedAmount && token.stakedAmountUsd && (
                                    <div className="mt-2 pl-12">
                                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-2 border border-blue-100 dark:border-blue-800/50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                                        {token.stakedAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {token.symbol} Staked
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                                        {formatCurrency(token.stakedAmountUsd)} • {token.apy}% APY
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            </CardContent>

            <CardFooter className="px-4 py-3 flex justify-between border-t border-slate-200 dark:border-slate-800">
                <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Tokens</span>
                </Button>

                <Button variant="outline" size="sm" className="gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    <span>Swap</span>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default TokenBalances;