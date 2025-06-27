// NFTPurchaseConfig.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Gem,
    ChevronRight,
    ChevronLeft,
    Check,
    X,
    Search,
    Info,
    Wallet,
    Image as ImageIcon,
    Tag,
    Layers,
    TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// NFTPurchaseConfig component
interface NFTPurchaseConfigProps {
    onNext: () => void;
    onBack: () => void;
}

export const NFTPurchaseConfig: React.FC<NFTPurchaseConfigProps> = ({ onNext, onBack }) => {
    // Popular collections data
    const collections = [
        { id: "bayc", name: "Bored Ape Yacht Club", icon: "/icons/bayc.svg", floor: "50.5 ETH", volume: "12.3 ETH", items: "10,000" },
        { id: "azuki", name: "Azuki", icon: "/icons/azuki.svg", floor: "12.7 ETH", volume: "5.8 ETH", items: "10,000" },
        { id: "doodles", name: "Doodles", icon: "/icons/doodles.svg", floor: "6.8 ETH", volume: "2.1 ETH", items: "10,000" },
        { id: "punks", name: "CryptoPunks", icon: "/icons/punks.svg", floor: "62.5 ETH", volume: "8.9 ETH", items: "10,000" },
        { id: "moonbirds", name: "Moonbirds", icon: "/icons/moonbirds.svg", floor: "7.2 ETH", volume: "3.4 ETH", items: "10,000" },
    ];

    // Marketplace options
    const marketplaces = [
        { id: "opensea", name: "OpenSea", icon: "/icons/opensea.svg", fee: "2.5%" },
        { id: "blur", name: "Blur", icon: "/icons/blur.svg", fee: "0.5%" },
        { id: "looksrare", name: "LooksRare", icon: "/icons/looksrare.svg", fee: "2.0%" },
        { id: "x2y2", name: "X2Y2", icon: "/icons/x2y2.svg", fee: "0.5%" },
    ];

    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [customCollection, setCustomCollection] = useState("");
    const [selectedMarketplace, setSelectedMarketplace] = useState<string>("opensea");
    const [purchaseType, setPurchaseType] = useState<string>("floor");
    const [priceThreshold, setPriceThreshold] = useState<string>("");
    const [floorDropPercentage, setFloorDropPercentage] = useState<number>(10);
    const [budget, setBudget] = useState<string>("");
    const [traitFilters, setTraitFilters] = useState<string[]>([]);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [gasLevel, setGasLevel] = useState(50);
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifyApp, setNotifyApp] = useState(true);
    const [autoRelist, setAutoRelist] = useState(false);

    const isValid = (selectedCollection || customCollection) && budget && (purchaseType === 'specific' || purchaseType === 'floor' || (purchaseType === 'trait' && traitFilters.length));

    // Mock traits for selected collection
    const collectionTraits = [
        { name: "Background", values: ["Blue", "Yellow", "Red", "Green", "Purple"] },
        { name: "Eyes", values: ["Angry", "Bored", "Sleepy", "Laser", "Wide"] },
        { name: "Mouth", values: ["Grin", "Cigarette", "Bored", "Dumbfounded", "Smile"] },
        { name: "Clothes", values: ["Suit", "Sailor", "Leather Jacket", "Tank Top", "Hawaiian"] },
        { name: "Accessories", values: ["Earring", "Gold Chain", "Silver Chain", "None"] },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Configure NFT Purchase
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Set up automated NFT purchases based on floor price and rarity
                </p>

                {/* Collection Selection */}
                <div className="space-y-4 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                        Select NFT Collection
                    </h4>
                    <Tabs defaultValue="trending" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="trending">Trending</TabsTrigger>
                            <TabsTrigger value="volume">Volume</TabsTrigger>
                            <TabsTrigger value="watched">Watched</TabsTrigger>
                        </TabsList>
                        <TabsContent value="trending" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {collections.map((collection) => (
                                    <motion.div
                                        key={collection.id}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => setSelectedCollection(collection.id)}
                                        className={cn(
                                            "border rounded-lg p-3 cursor-pointer transition-all",
                                            selectedCollection === collection.id
                                                ? "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                                                : "border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-900"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                                <Avatar className="h-11 w-11">
                                                    <AvatarImage src={collection.icon} alt={collection.name} />
                                                    <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200 text-xs">
                                                        {collection.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-900 dark:text-slate-100">{collection.name}</h4>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        <span>Floor: {collection.floor}</span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                                        <Wallet className="h-3 w-3 mr-1" />
                                                        <span>Vol: {collection.volume}</span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                                        <Layers className="h-3 w-3 mr-1" />
                                                        <span>{collection.items} items</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedCollection === collection.id && (
                                                <div className="ml-auto">
                                                    <Check className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="volume" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {collections.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume)).map((collection) => (
                                    <motion.div
                                        key={collection.id}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => setSelectedCollection(collection.id)}
                                        className={cn(
                                            "border rounded-lg p-3 cursor-pointer transition-all",
                                            selectedCollection === collection.id
                                                ? "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                                                : "border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-900"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                                <Avatar className="h-11 w-11">
                                                    <AvatarImage src={collection.icon} alt={collection.name} />
                                                    <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200 text-xs">
                                                        {collection.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-900 dark:text-slate-100">{collection.name}</h4>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        <span>Floor: {collection.floor}</span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                                        <Wallet className="h-3 w-3 mr-1" />
                                                        <span>Vol: {collection.volume}</span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                                        <Layers className="h-3 w-3 mr-1" />
                                                        <span>{collection.items} items</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedCollection === collection.id && (
                                                <div className="ml-auto">
                                                    <Check className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="watched" className="mt-0">
                            <div className="text-center py-6">
                                <ImageIcon className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
                                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">No Watched Collections</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Add collections to your watchlist to see them here
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="relative">
                        <Input
                            placeholder="Enter custom collection address (0x...)"
                            value={customCollection}
                            onChange={(e) => {
                                setCustomCollection(e.target.value);
                                setSelectedCollection(null);
                            }}
                            className={cn(
                                "pl-10",
                                customCollection && "border-purple-500 dark:border-purple-400"
                            )}
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        {customCollection && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                onClick={() => setCustomCollection("")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Marketplace Selection */}
                <div className="space-y-3 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                        Select Marketplace
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {marketplaces.map((marketplace) => (
                            <motion.div
                                key={marketplace.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedMarketplace(marketplace.id)}
                                className={cn(
                                    "border rounded-lg p-2.5 cursor-pointer transition-all flex items-center gap-2",
                                    selectedMarketplace === marketplace.id
                                        ? "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                                        : "border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-900"
                                )}
                            >
                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={marketplace.icon} alt={marketplace.name} />
                                        <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200 text-xs">
                                            {marketplace.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">{marketplace.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Fee: {marketplace.fee}</p>
                                </div>
                                {selectedMarketplace === marketplace.id && (
                                    <Check className="h-4 w-4 ml-1 text-purple-600 dark:text-purple-400" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Purchase Type */}
                <div className="space-y-3 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                        Purchase Strategy
                    </h4>
                    <RadioGroup value={purchaseType} onValueChange={setPurchaseType} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="floor" id="purchase-floor" />
                            <label htmlFor="purchase-floor" className="text-sm text-slate-700 dark:text-slate-300">
                                Buy when floor price drops
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="specific" id="purchase-specific" />
                            <label htmlFor="purchase-specific" className="text-sm text-slate-700 dark:text-slate-300">
                                Buy specific NFT(s) at target price
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="trait" id="purchase-trait" />
                            <label htmlFor="purchase-trait" className="text-sm text-slate-700 dark:text-slate-300">
                                Buy based on traits and rarity
                            </label>
                        </div>
                    </RadioGroup>

                    {purchaseType === 'floor' && (
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Floor Price Drop
                                </h5>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">
                                        Buy when floor price drops by
                                    </label>
                                    <div className="space-y-4">
                                        <Slider
                                            value={[floorDropPercentage]}
                                            min={1}
                                            max={30}
                                            step={1}
                                            onValueChange={(value) => setFloorDropPercentage(value[0])}
                                            className="my-2"
                                        />
                                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                            <span>1%</span>
                                            <span>Current: {floorDropPercentage}%</span>
                                            <span>30%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800/50 text-sm text-blue-700 dark:text-blue-300">
                                    <div className="flex gap-2 items-start">
                                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <p>
                                            Current floor price is {collections.find(c => c.id === selectedCollection)?.floor || "50 ETH"}.
                                            The system will buy when it drops to {floorDropPercentage}% lower.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {purchaseType === 'specific' && (
                        <div className="mt-4 space-y-4">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">
                                        Enter NFT IDs (comma separated)
                                    </label>
                                    <Input
                                        placeholder="e.g., 1234, 5678, 9012"
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">
                                        Maximum price willing to pay (per NFT)
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Enter max price"
                                            value={priceThreshold}
                                            onChange={(e) => setPriceThreshold(e.target.value)}
                                            className="pl-10"
                                        />
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-slate-500">
                                            ETH
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {purchaseType === 'trait' && (
                        <div className="mt-4 space-y-4">
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">
                                        Select traits to filter
                                    </label>

                                    {collectionTraits.map((traitCategory, index) => (
                                        <div key={index} className="space-y-2">
                                            <h6 className="text-xs font-medium text-slate-700 dark:text-slate-300">{traitCategory.name}</h6>
                                            <div className="flex flex-wrap gap-2">
                                                {traitCategory.values.map((value, vIndex) => {
                                                    const traitId = `${traitCategory.name}:${value}`;
                                                    const isSelected = traitFilters.includes(traitId);

                                                    return (
                                                        <Badge
                                                            key={vIndex}
                                                            variant="outline"
                                                            className={cn(
                                                                "cursor-pointer py-1 px-3",
                                                                isSelected
                                                                    ? "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                                                                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            )}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setTraitFilters(traitFilters.filter(t => t !== traitId));
                                                                } else {
                                                                    setTraitFilters([...traitFilters, traitId]);
                                                                }
                                                            }}
                                                        >
                                                            {value}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">
                                        Maximum price willing to pay (per NFT)
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Enter max price"
                                            value={priceThreshold}
                                            onChange={(e) => setPriceThreshold(e.target.value)}
                                            className="pl-10"
                                        />
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-slate-500">
                                            ETH
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Budget Input */}
                <div className="space-y-3 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                        Budget
                    </h4>
                    <div className="relative">
                        <Input
                            type="text"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            placeholder="Enter your budget"
                            className="pl-10"
                        />
                        <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">ETH</span>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        Maximum amount to spend on this task.
                    </div>
                </div>

                {/* Advanced Settings */}
                <div className="mt-8">
                    <Button
                        variant="ghost"
                        className="flex items-center w-full justify-between p-0 h-auto"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                            Advanced Settings
                        </span>
                        <ChevronRight
                            className={cn(
                                "h-5 w-5 text-slate-400 transition-transform",
                                showAdvanced && "transform rotate-90"
                            )}
                        />
                    </Button>

                    <AnimatePresence>
                        {showAdvanced && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden mt-4"
                            >
                                <div className="space-y-6 border-t border-slate-200 dark:border-slate-800 pt-4">
                                    {/* Gas Settings */}
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                            Gas Price Limit
                                        </h4>
                                        <div className="space-y-4">
                                            <Slider
                                                value={[gasLevel]}
                                                min={0}
                                                max={100}
                                                step={5}
                                                onValueChange={(value) => setGasLevel(value[0])}
                                                className="my-2"
                                            />
                                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                                <span>Low (Save Gas)</span>
                                                <span>Current: {gasLevel} gwei</span>
                                                <span>High (Fast)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Auto-relist Settings */}
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                            Auto-Relist
                                        </h4>
                                        <div className="flex items-center justify-between">
                                            <label
                                                htmlFor="auto-relist"
                                                className="text-sm text-slate-600 dark:text-slate-400"
                                            >
                                                Automatically list purchased NFTs for sale
                                            </label>
                                            <Switch
                                                id="auto-relist"
                                                checked={autoRelist}
                                                onCheckedChange={setAutoRelist}
                                            />
                                        </div>

                                        {autoRelist && (
                                            <div className="mt-4 space-y-2">
                                                <label className="text-xs text-slate-500 dark:text-slate-400">
                                                    Relist price (% markup)
                                                </label>
                                                <div className="space-y-4">
                                                    <Slider
                                                        defaultValue={[20]}
                                                        min={5}
                                                        max={100}
                                                        step={5}
                                                        className="my-2"
                                                    />
                                                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                                        <span>5%</span>
                                                        <span>Current: 20%</span>
                                                        <span>100%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notification Settings */}
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                            Notifications
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label
                                                    htmlFor="notify-email"
                                                    className="text-sm text-slate-600 dark:text-slate-400"
                                                >
                                                    Email notifications
                                                </label>
                                                <Switch
                                                    id="notify-email"
                                                    checked={notifyEmail}
                                                    onCheckedChange={setNotifyEmail}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <label
                                                    htmlFor="notify-app"
                                                    className="text-sm text-slate-600 dark:text-slate-400"
                                                >
                                                    In-app notifications
                                                </label>
                                                <Switch
                                                    id="notify-app"
                                                    checked={notifyApp}
                                                    onCheckedChange={setNotifyApp}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button variant="outline" onClick={onBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button
                    disabled={!isValid}
                    onClick={onNext}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};