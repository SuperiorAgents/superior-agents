"use client";

import React, { useState } from "react";
import {
    Gem,
    ArrowRight,
    PlusCircle,
    RefreshCw,
    Clock,
    ExternalLink,
    Users,
    Info,
    Zap,
    CheckCircle2,
    MoreHorizontal,
    Eye,
    Sparkles,
    Wallet,
    Tag,
    Layers,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import CreateTaskModal from "@/components/Dashbaord/Tasks/CreateTaskModal";

// Component type definitions to fix TypeScript errors
type CollectionInsight = {
    name: string;
    logo: string;
    summary: string;
    stats: {
        floorPrice: string;
        floorChange: string;
        volume: string;
        volumeChange: string;
        items: string;
        holders: string;
    };
    priceHistory?: { day: string; price: number }[];
    traitData?: {
        trait: string;
        rarity: number;
        premium: number;
        values: {
            name: string;
            count: number;
            rarity: string;
            floorDelta: string;
        }[];
    }[];
    recommendations: {
        title: string;
        reason: string;
        impact: string;
        implementation: string;
    }[];
    opportunities: {
        title: string;
        description: string;
        timeWindow: string;
        expectedPrice: string;
        rarity: string;
        recommendation: string;
    }[];
};

const NFTPurchasePage = () => {
    const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
    const [insightModalOpen, setInsightModalOpen] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);

    // Function to open collection insight modal
    const openCollectionInsight = (collectionId: string) => {
        setSelectedCollection(collectionId);
        setInsightLoading(true);
        setInsightModalOpen(true);

        // Simulate loading data from API
        setTimeout(() => {
            setInsightLoading(false);
        }, 1500);
    };

    // Active tasks data
    const activeTasks = [
        {
            id: "task-1",
            collection: "Bored Ape Yacht Club",
            icon: "/icons/bayc.svg",
            rule: "Buy when floor price drops by 10%",
            budget: "50 ETH",
            marketplace: "Blur",
            status: "active",
            currentFloor: "50.5 ETH"
        }
    ];

    // Recent tasks history
    const tasksHistory = [
        {
            id: "history-1",
            collection: "Doodles",
            icon: "/icons/doodles.svg",
            rule: "Buy specific NFTs with rare traits",
            completedDate: "May 9, 2023",
            purchased: 2,
            outcome: "successful",
            avgPrice: "6.2 ETH"
        },
        {
            id: "history-2",
            collection: "Azuki",
            icon: "/icons/azuki.svg",
            rule: "Buy when floor price drops by 15%",
            completedDate: "Apr 22, 2023",
            purchased: 1,
            outcome: "successful",
            avgPrice: "12.1 ETH"
        }
    ];

    // Collections data for insights
    const collectionData = [
        {
            id: "bayc",
            name: "Bored Ape Yacht Club",
            icon: "/icons/bayc.svg",
            floor: "50.5 ETH",
            floorTrend: "-2.3%",
            volume: "12.3 ETH",
            items: "10,000",
            marketplace: "OpenSea"
        },
        {
            id: "azuki",
            name: "Azuki",
            icon: "/icons/azuki.svg",
            floor: "12.7 ETH",
            floorTrend: "+1.5%",
            volume: "5.8 ETH",
            items: "10,000",
            marketplace: "Blur"
        },
        {
            id: "doodles",
            name: "Doodles",
            icon: "/icons/doodles.svg",
            floor: "6.8 ETH",
            floorTrend: "-0.8%",
            volume: "2.1 ETH",
            items: "10,000",
            marketplace: "OpenSea"
        },
        {
            id: "punks",
            name: "CryptoPunks",
            icon: "/icons/punks.svg",
            floor: "62.5 ETH",
            floorTrend: "+0.2%",
            volume: "8.9 ETH",
            items: "10,000",
            marketplace: "Blur"
        },
        {
            id: "moonbirds",
            name: "Moonbirds",
            icon: "/icons/moonbirds.svg",
            floor: "7.2 ETH",
            floorTrend: "-1.3%",
            volume: "3.4 ETH",
            items: "10,000",
            marketplace: "OpenSea"
        }
    ];

    // Detailed insight data for each collection
    const collectionInsights: Record<string, CollectionInsight> = {
        "bayc": {
            name: "Bored Ape Yacht Club",
            logo: "/icons/bayc.svg",
            summary: "Consistently strong performance with floor price fluctuations creating strategic buying opportunities.",
            stats: {
                floorPrice: "50.5 ETH",
                floorChange: "-2.3%",
                volume: "12.3 ETH/day",
                volumeChange: "+5.1%",
                items: "10,000",
                holders: "6,212"
            },
            priceHistory: [
                { day: "Day 1", price: 52.1 },
                { day: "Day 2", price: 51.8 },
                { day: "Day 3", price: 51.5 },
                { day: "Day 4", price: 51.0 },
                { day: "Day 5", price: 50.7 },
                { day: "Day 6", price: 50.5 },
                { day: "Day 7", price: 50.5 }
            ],
            traitData: [
                {
                    trait: "Background",
                    rarity: 12.5,
                    premium: 15.2,
                    values: [
                        { name: "Blue", count: 1242, rarity: "12.4%", floorDelta: "+2.5 ETH" },
                        { name: "Yellow", count: 951, rarity: "9.5%", floorDelta: "+3.2 ETH" },
                        { name: "Purple", count: 496, rarity: "5.0%", floorDelta: "+5.8 ETH" }
                    ]
                },
                {
                    trait: "Eyes",
                    rarity: 8.3,
                    premium: 23.7,
                    values: [
                        { name: "Angry", count: 432, rarity: "4.3%", floorDelta: "+3.7 ETH" },
                        { name: "Bored", count: 1714, rarity: "17.1%", floorDelta: "+0.8 ETH" },
                        { name: "Laser", count: 69, rarity: "0.7%", floorDelta: "+18.3 ETH" }
                    ]
                },
                {
                    trait: "Mouth",
                    rarity: 10.1,
                    premium: 18.5,
                    values: [
                        { name: "Grin", count: 713, rarity: "7.1%", floorDelta: "+2.1 ETH" },
                        { name: "Bored", count: 2031, rarity: "20.3%", floorDelta: "+0.3 ETH" },
                        { name: "Cigarette", count: 710, rarity: "7.1%", floorDelta: "+4.2 ETH" }
                    ]
                }
            ],
            recommendations: [
                {
                    title: "Target 'Laser Eyes' trait",
                    reason: "Laser Eyes trait consistently commands significant premium regardless of market conditions",
                    impact: "high",
                    implementation: "Set up trait-based purchase task focusing on Laser Eyes with reasonable price threshold"
                },
                {
                    title: "Monitor floor price drops",
                    reason: "Collection is experiencing price consolidation with temporary dips, optimal for entry",
                    impact: "medium",
                    implementation: "Configure automatic purchase at 5-10% below floor"
                }
            ],
            opportunities: [
                {
                    title: "Rare Trait Combo Entry Point",
                    description: "Apes with Laser Eyes + Cigarette mouth are highly sought after but some are listed near floor",
                    timeWindow: "Limited (2-3 days)",
                    expectedPrice: "55-65 ETH",
                    rarity: "Top 0.5%",
                    recommendation: "Set up trait-specific monitoring for this combination with max budget of 65 ETH"
                },
                {
                    title: "Floor Price Consolidation",
                    description: "Technical indicators suggest floor price has stabilized and may rebound soon",
                    timeWindow: "Next 1-2 weeks",
                    expectedPrice: "48-50 ETH",
                    rarity: "Floor",
                    recommendation: "Set up floor monitoring with 5% drop threshold for optimal entry point"
                }
            ]
        },
        "azuki": {
            name: "Azuki",
            logo: "/icons/azuki.svg",
            summary: "Rising floor prices and increasing trading volume indicate growing market interest and strength.",
            stats: {
                floorPrice: "12.7 ETH",
                floorChange: "+1.5%",
                volume: "5.8 ETH/day",
                volumeChange: "+12.4%",
                items: "10,000",
                holders: "5,139"
            },
            priceHistory: [
                { day: "Day 1", price: 12.0 },
                { day: "Day 2", price: 12.1 },
                { day: "Day 3", price: 12.3 },
                { day: "Day 4", price: 12.5 },
                { day: "Day 5", price: 12.6 },
                { day: "Day 6", price: 12.7 },
                { day: "Day 7", price: 12.7 }
            ],
            recommendations: [
                {
                    title: "Focus on rare type traits",
                    reason: "Blue and Red type Azukis consistently trade at premium and are liquid in down markets",
                    impact: "high",
                    implementation: "Configure trait-based purchase strategy targeting specific Azuki types"
                }
            ],
            opportunities: [
                {
                    title: "Partnership Announcement Opportunity",
                    description: "Rumors of upcoming partnership announcement that may drive prices up",
                    timeWindow: "7-14 days",
                    expectedPrice: "Current floor with potential 20-30% upside",
                    rarity: "Any",
                    recommendation: "Set up floor purchase rule with quick execution"
                }
            ]
        },
        "doodles": {
            name: "Doodles",
            logo: "/icons/doodles.svg",
            summary: "Stabilizing after recent decline with increasing buy pressure and community development.",
            stats: {
                floorPrice: "6.8 ETH",
                floorChange: "-0.8%",
                volume: "2.1 ETH/day",
                volumeChange: "+3.2%",
                items: "10,000",
                holders: "4,873"
            },
            recommendations: [
                {
                    title: "Target specific colorways",
                    reason: "Rainbow and Alien Doodles maintain higher value floor regardless of market conditions",
                    impact: "medium",
                    implementation: "Create trait filter task focusing on these rare colorways"
                }
            ],
            opportunities: [
                {
                    title: "Strategic Dip Entry",
                    description: "Current slight dip represents potential entry point before upcoming project developments",
                    timeWindow: "1-3 weeks",
                    expectedPrice: "6.5-7.0 ETH",
                    rarity: "Floor",
                    recommendation: "Set up floor monitoring with small drop threshold (3-5%)"
                }
            ]
        },
        "punks": {
            name: "CryptoPunks",
            logo: "/icons/punks.svg",
            summary: "Blue-chip status with stable floor and consistent demand from institutional collectors.",
            stats: {
                floorPrice: "62.5 ETH",
                floorChange: "+0.2%",
                volume: "8.9 ETH/day",
                volumeChange: "-2.1%",
                items: "10,000",
                holders: "3,461"
            },
            recommendations: [
                {
                    title: "Target non-human types",
                    reason: "Zombie, Ape and Alien Punks have shown highest historical appreciation",
                    impact: "high",
                    implementation: "Configure trait-specific purchase strategy with higher budget allocation"
                }
            ],
            opportunities: [
                {
                    title: "Accessory Arbitrage",
                    description: "Punks with 4+ accessories are currently undervalued relative to historical averages",
                    timeWindow: "Medium-term (1-2 months)",
                    expectedPrice: "70-85 ETH",
                    rarity: "Mid-tier",
                    recommendation: "Set up attribute count filter with budget of 75-80 ETH maximum"
                }
            ]
        },
        "moonbirds": {
            name: "Moonbirds",
            logo: "/icons/moonbirds.svg",
            summary: "Recent price correction creating potential entry opportunities for long-term holders.",
            stats: {
                floorPrice: "7.2 ETH",
                floorChange: "-1.3%",
                volume: "3.4 ETH/day",
                volumeChange: "-0.5%",
                items: "10,000",
                holders: "5,872"
            },
            recommendations: [
                {
                    title: "Target Enlightened trait",
                    reason: "Enlightened Moonbirds are scarce and maintain premium in all market conditions",
                    impact: "medium",
                    implementation: "Set up trait-specific purchase rule with reasonable price ceiling"
                }
            ],
            opportunities: [
                {
                    title: "Dip Buying Opportunity",
                    description: "Recent price correction may present favorable entry points",
                    timeWindow: "Short-term (days to weeks)",
                    expectedPrice: "6.8-7.2 ETH",
                    rarity: "Floor to mid-tier",
                    recommendation: "Configure floor monitoring with 5-8% drop threshold"
                }
            ]
        }
    };

    // Get selected collection insights
    const getSelectedCollectionInsights = () => {
        if (!selectedCollection) return null;
        return collectionInsights[selectedCollection];
    };

    return (
        <div className="container mx-auto py-6 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span className="flex items-center gap-2">
                            <Gem className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            NFT Purchase Automation
                        </span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Automate NFT purchases based on floor price, traits, and market conditions
                    </p>
                </div>
                <Button
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    onClick={() => setCreateTaskModalOpen(true)}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Purchase Task
                </Button>
            </div>

            {/* Interactive Collection Intelligence Section */}
            <Card className="border-purple-100 dark:bg-slate-900/90  dark:border-indigo-900/30 shadow-lg overflow-hidden">
                <CardHeader className="pb-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            <CardTitle className="text-lg">NFT Market Intelligence</CardTitle>
                        </div>
                        <Badge variant="outline" className="px-2 py-1 text-xs bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                            <Clock className="mr-1 h-3 w-3" />
                            Live Floor Data
                        </Badge>
                    </div>
                    <CardDescription>
                        Analyze collections, track floor prices, and get personalized purchase recommendations
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-0 mt-4">
                    <div className="p-4 bg-gradient-to-b from-purple-50/50 to-indigo-50/30 dark:from-purple-950/20 dark:to-indigo-950/10 border-y border-purple-100/50 dark:border-purple-800/30 mb-4">
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                            Click on any collection to view detailed insights, compare traits, and get strategic recommendations for optimal NFT purchases.
                        </p>
                    </div>

                    {/* Collection Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {collectionData.map(collection => (
                            <Card
                                key={collection.id}
                                className="group hover:border-purple-300 dark:hover:border-purple-700 
                                transition-all cursor-pointer relative overflow-hidden
                                dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                                onClick={() => openCollectionInsight(collection.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={collection.icon} alt={collection.name} />
                                            <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200">
                                                {collection.name.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold">{collection.name}</h3>
                                            <Badge variant="outline" className="mt-1 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                                <Layers className="mr-1 h-3 w-3" />
                                                {collection.marketplace}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="flex justify-between items-center mb-1 text-sm">
                                            <span className="text-slate-600 dark:text-slate-400">Floor Price</span>
                                            <span className="font-medium">{collection.floor}
                                                <span className={cn(
                                                    "text-xs ml-1",
                                                    collection.floorTrend.startsWith("+")
                                                        ? "text-green-600 dark:text-green-400"
                                                        : "text-red-600 dark:text-red-400"
                                                )}>
                                                    {collection.floorTrend}
                                                </span>
                                            </span>
                                        </div>
                                        <Progress
                                            value={parseFloat(collection.floor)}
                                            max={70}
                                            className="h-1.5 [&>div]:bg-purple-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 dark:text-slate-400">24h Volume</span>
                                                <span className="font-medium">{collection.volume}</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 dark:text-slate-400">Items</span>
                                                <span className="font-medium">{collection.items}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-1 group-hover:bg-purple-50 group-hover:text-purple-600 
                                        dark:group-hover:bg-purple-900/20 dark:group-hover:text-purple-400 
                                        group-hover:border-purple-200 dark:group-hover:border-purple-800
                                        dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg 
                                        "
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        View Collection Insights
                                    </Button>

                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-purple-500/5 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Tasks Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Tasks */}
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-purple-500" />
                                Active Purchase Tasks
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 text-purple-600"
                                onClick={() => setCreateTaskModalOpen(true)}
                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span>Add New</span>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {activeTasks.length > 0 ? (
                            <div className="space-y-4">
                                {activeTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10 mt-1">
                                                <AvatarImage src={task.icon} alt={task.collection} />
                                                <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200">
                                                    {task.collection.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900 dark:text-white">{task.collection}</h4>
                                                        <Badge className="mt-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-normal">
                                                            Active
                                                        </Badge>
                                                    </div>
                                                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        On {task.marketplace}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                                    <span className="font-medium">Rule:</span> {task.rule}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                    <div className="flex items-center gap-1">
                                                        <Tag className="h-3.5 w-3.5" />
                                                        <span>Current Floor: {task.currentFloor}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Wallet className="h-3.5 w-3.5" />
                                                        <span>Budget: {task.budget}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                <Gem className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No active tasks</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">
                                    You don't have any active NFT purchase tasks. Create one to start automating your collection.
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => setCreateTaskModalOpen(true)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Task
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Completed Tasks */}
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            Purchase History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tasksHistory.length > 0 ? (
                            <div className="space-y-4">
                                {tasksHistory.map(task => (
                                    <div
                                        key={task.id}
                                        className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10 mt-1">
                                                <AvatarImage src={task.icon} alt={task.collection} />
                                                <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200">
                                                    {task.collection.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900 dark:text-white">{task.collection}</h4>
                                                        <Badge className="mt-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 font-normal">
                                                            Completed
                                                        </Badge>
                                                    </div>
                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        {task.purchased} NFT{task.purchased > 1 ? 's' : ''} Purchased
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                                    <span className="font-medium">Strategy:</span> {task.rule}
                                                </p>
                                                <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span>{task.completedDate}</span>
                                                    </div>
                                                    <div>Avg Price: {task.avgPrice}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-center pt-2">
                                    <Button variant="link" className="text-purple-600 dark:text-purple-400 h-auto p-0">
                                        View All History
                                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                <Gem className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No purchase history</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                                    Your completed NFT purchase tasks will appear here
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Resources Section */}
            <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                <CardHeader>
                    <CardTitle className="text-lg">Resources & Guides</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Info className="h-4 w-4 text-purple-600" />
                                <span>NFT Market Guide</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Learn strategies for identifying undervalued NFTs and optimal purchase timing
                            </p>
                            <Button variant="link" className="h-auto p-0 text-purple-600 dark:text-purple-400">
                                Read Guide
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4 text-purple-600" />
                                <span>Collector Strategies</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Explore the most successful NFT acquisition strategies used by top collectors
                            </p>
                            <Button variant="link" className="h-auto p-0 text-purple-600 dark:text-purple-400">
                                See Examples
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-600" />
                                <span>Trait Rarity Analysis</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Learn how to assess NFT traits and rarity for value-based purchasing decisions
                            </p>
                            <Button variant="link" className="h-auto p-0 text-purple-600 dark:text-purple-400">
                                View Guide
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Collection Insights Modal */}
            <Dialog open={insightModalOpen} onOpenChange={setInsightModalOpen}>
                <DialogContent className="sm:max-w-[900px] p-0 max-h-[90vh] overflow-hidden dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                    {insightLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="text-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium">Loading insights...</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    Fetching the latest floor price data and collection analytics
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {selectedCollection && (
                                <div className="flex flex-col h-full max-h-[90vh] dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                    <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={collectionInsights[selectedCollection]?.logo} />
                                                <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                                    {collectionInsights[selectedCollection]?.name.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <DialogTitle className="text-xl">
                                                    {collectionInsights[selectedCollection]?.name} Insights
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Floor price trends, trait analysis, and purchase recommendations
                                                </DialogDescription>
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <ScrollArea className="flex-1 px-6 py-4 h-full">
                                        <div className="space-y-6">
                                            {/* Summary */}
                                            <div className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 rounded-lg p-4">
                                                    <p className="text-purple-800 dark:text-purple-300">
                                                        {getSelectedCollectionInsights()?.summary}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Stats Overview */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-3">Collection Overview</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    <Card className="bg-slate-50/50 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">Floor Price</p>
                                                            <div className="flex items-baseline">
                                                                <span className="text-2xl font-bold">{getSelectedCollectionInsights()?.stats.floorPrice}</span>
                                                                <Badge className={cn(
                                                                    "ml-2",
                                                                    getSelectedCollectionInsights()?.stats.floorChange?.startsWith("+")
                                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                )}>
                                                                    {getSelectedCollectionInsights()?.stats.floorChange}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50/50 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
                                                            <div className="flex items-baseline">
                                                                <span className="text-2xl font-bold">{getSelectedCollectionInsights()?.stats.volume}</span>
                                                                <Badge className={cn(
                                                                    "ml-2",
                                                                    getSelectedCollectionInsights()?.stats.volumeChange?.startsWith("+")
                                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                )}>
                                                                    {getSelectedCollectionInsights()?.stats.volumeChange}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50/50  dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">Collection Stats</p>
                                                            <div className="text-sm space-y-0.5">
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500 dark:text-slate-400">Items:</span>
                                                                    <span className="font-medium">{getSelectedCollectionInsights()?.stats.items}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500 dark:text-slate-400">Unique holders:</span>
                                                                    <span className="font-medium">{getSelectedCollectionInsights()?.stats.holders}</span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Price History Chart */}
                                            {getSelectedCollectionInsights()?.priceHistory && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">Floor Price Trend (7 Days)</h3>
                                                    <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                                        <CardContent className="p-4">
                                                            <div className="h-64 w-full">
                                                                <div className="flex justify-center items-center h-full">
                                                                    <div className="w-full flex flex-col space-y-2">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Price (ETH)</div>
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Time</div>
                                                                        </div>
                                                                        <div className="relative h-52 w-full">
                                                                            <div className="absolute bottom-0 left-0 right-0 top-0">
                                                                                {/* Simple chart visualization */}
                                                                                <div className="relative h-full w-full">
                                                                                    <div className="absolute inset-0 flex items-end justify-between px-2">
                                                                                        {getSelectedCollectionInsights()?.priceHistory?.map((point, i) => (
                                                                                            <div key={i} className="flex flex-col items-center">
                                                                                                <div
                                                                                                    className="bg-purple-500 dark:bg-purple-400 rounded-t w-10"
                                                                                                    style={{ height: `${(point.price / 60) * 100}%` }}
                                                                                                ></div>
                                                                                                <span className="text-xs mt-1">{point.day}</span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            )}

                                            {/* Trait Analysis */}
                                            {getSelectedCollectionInsights()?.traitData && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">Trait Analysis</h3>
                                                    <div className="space-y-4">
                                                        {getSelectedCollectionInsights()?.traitData?.map((trait, i) => (
                                                            <Card key={i} className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                                                <CardHeader className="py-3 px-4">
                                                                    <div className="flex justify-between items-center">
                                                                        <h4 className="text-md font-medium">{trait.trait}</h4>
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                                                Rarity: {trait.rarity}%
                                                                            </Badge>
                                                                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                                Premium: {trait.premium}%
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                </CardHeader>
                                                                <CardContent className="pt-0 px-4 pb-4 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                                                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                                        <div className="grid grid-cols-12 text-sm font-medium bg-slate-50 dark:bg-slate-800/80 p-2 border-b border-slate-200 dark:border-slate-700">
                                                                            <div className="col-span-4">Value</div>
                                                                            <div className="col-span-2 text-center">Count</div>
                                                                            <div className="col-span-3 text-center">Rarity</div>
                                                                            <div className="col-span-3 text-center">Floor Delta</div>
                                                                        </div>

                                                                        {trait.values.map((value, vi) => (
                                                                            <div key={vi} className="grid grid-cols-12 p-2 text-sm border-b border-slate-200 dark:border-slate-700 last:border-0">
                                                                                <div className="col-span-4 font-medium">{value.name}</div>
                                                                                <div className="col-span-2 text-center">{value.count}</div>
                                                                                <div className="col-span-3 text-center">
                                                                                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                                                        {value.rarity}
                                                                                    </Badge>
                                                                                </div>
                                                                                <div className="col-span-3 text-center">
                                                                                    <Badge className={cn(
                                                                                        value.floorDelta.startsWith("+")
                                                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                                    )}>
                                                                                        {value.floorDelta}
                                                                                    </Badge>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recommended Strategies */}
                                            {getSelectedCollectionInsights()?.recommendations && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">Recommended Strategies</h3>
                                                    <div className="space-y-4">
                                                        {getSelectedCollectionInsights()?.recommendations.map((rec, i) => (
                                                            <Card key={i} className="bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30 ">
                                                                <CardContent className="p-4">
                                                                    <div className="flex gap-3">
                                                                        <Badge className={cn(
                                                                            "h-fit",
                                                                            rec.impact === "high"
                                                                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                                                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                        )}>
                                                                            {rec.impact === "high" ? "High Impact" : "Medium Impact"}
                                                                        </Badge>
                                                                        <div>
                                                                            <h4 className="font-medium text-purple-800 dark:text-purple-300">{rec.title}</h4>
                                                                            <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">{rec.reason}</p>
                                                                            <div className="mt-3 flex justify-between items-center">
                                                                                <p className="text-xs italic text-slate-600 dark:text-slate-400">
                                                                                    <span className="font-medium">Implementation:</span> {rec.implementation}
                                                                                </p>
                                                                                <Button
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        setInsightModalOpen(false);
                                                                                        setCreateTaskModalOpen(true);
                                                                                    }}
                                                                                    className="text-xs h-8 gap-1 bg-purple-600 hover:bg-purple-700 text-white"
                                                                                >
                                                                                    <Zap className="h-3 w-3" />
                                                                                    Create Task
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Purchase Opportunities */}
                                            {getSelectedCollectionInsights()?.opportunities && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">Current Opportunities</h3>
                                                    <div className="space-y-4">
                                                        {getSelectedCollectionInsights()?.opportunities.map((opp, i) => (
                                                            <Card key={i} className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-start justify-between">
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <h4 className="font-medium">{opp.title}</h4>
                                                                                <Badge className={cn(
                                                                                    opp.rarity.includes("Top") || opp.rarity.includes("Rare")
                                                                                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                                                                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                                                )}>
                                                                                    {opp.rarity}
                                                                                </Badge>
                                                                            </div>
                                                                            <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">{opp.description}</p>
                                                                        </div>
                                                                        <div className="flex items-center text-sm font-medium text-purple-600 dark:text-purple-400">
                                                                            <span>{opp.expectedPrice}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-md p-3 text-sm">
                                                                        <div>
                                                                            <span className="font-medium">Time window:</span> {opp.timeWindow}
                                                                        </div>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                setInsightModalOpen(false);
                                                                                setCreateTaskModalOpen(true);
                                                                            }}
                                                                            className="h-7 text-xs border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 dark:bg-slate-900/90 dark:border-indigo-900/30 shadow-lg "
                                                                        >
                                                                            Set Up Purchase
                                                                        </Button>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>

                                    <DialogFooter className="px-6 py-4 border-t dark:border-slate-800 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                        <div className="flex items-center justify-between w-full">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Data based on on-chain activity and marketplace analytics
                                            </p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" onClick={() => setInsightModalOpen(false)}>
                                                    Close
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setInsightModalOpen(false);
                                                        setCreateTaskModalOpen(true);
                                                    }}
                                                    className="gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                                                >
                                                    <PlusCircle className="h-4 w-4" />
                                                    Create Purchase Task
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogFooter>
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Task Modal */}
            <CreateTaskModal
                open={createTaskModalOpen}
                onOpenChange={setCreateTaskModalOpen}
                onTaskCreated={(newTask) => {
                    // Handle new task if needed
                    setCreateTaskModalOpen(false);
                }}
            />
        </div>
    );
};

export default NFTPurchasePage;