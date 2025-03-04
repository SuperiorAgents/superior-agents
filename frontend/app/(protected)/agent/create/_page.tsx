"use client";

import { extractRequiredVariables } from "@/helpers/promptHelper";
import { agentTypeList, useAgentContext } from "@/provider/agent";
import { useUserContext } from "@/provider/user-provider";
import { createAgent } from "@/repository/agent";
import {
  MetricsType,
  ModelType,
  NotifType,
  NotifTypeList,
  ResearchToolType,
  SourceType,
  TradingType,
} from "@/repository/interface";
import { getPrompts } from "@/repository/prompts";
import { createSession } from "@/repository/sessions";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

const tradingList: TradingType[] = ["1inch", "Hyperliquid"];

const researchTool: ResearchToolType = {
  marketing: ["DuckDuckGo"],
  trading: ["Twitter", "CoinGecko", "DuckDuckGo"],
};

const notifToolList: NotifTypeList = {
  marketing: {
    twitter_mentions: "Twitter @s",
    twitter_feed: "Twitter Trending",
  },
  trading: {
    twitter_mentions: "Twitter @s",
    twitter_feed: "Twitter Trending",
    // crypto_news_bitcoin_magazine: "Bitcoin Magazine RSS Feed",
    // crypto_news_cointelegraph: "Cointelegraph RSS Feed",
  },
};

const timehorizonList = ["1hr", "12hrs", "24hrs"];

const metricList = {
  marketing: {
    twitter_followers: "followers",
    twitter_likes: "likes",
  },
  trading: {
    value_of_wallet: "wallet",
    beating_the_market: "beating_market",
  },
};

interface IPrompt {
  name: string;
  prompt: string;
}

export function CreateAgentPage() {
  const [agentName, setAgentName] = useState<string>("");
  const [agentPicture, setAgentPicture] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>("claude");
  const [researchTools, setResearchTools] = useState<SourceType[]>([]);
  const [notifications, setNotifications] = useState<NotifType[]>([]);
  const [tradingInst, setTradingInst] = useState<TradingType[]>([]);
  const [selectedTimehorizon, setSelectedTimehorizon] = useState("1hr");
  const [selectedMetric, setSelectedMetric] = useState("wallet");
  const [agentRole, setAgentRole] = useState<string>("");

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [createLoading, setCreateLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [placeholderPrompts, setPlaceholderPrompts] = useState<IPrompt[]>([]);
  const [promptValues, setPromptValues] = useState<Record<string, string>>({});
  const [requiredPrompts, setRequiredPrompts] = useState<
    Record<string, string[]>
  >({});

  const [twitterAcc, setTwitterAcc] = useState<string>("");
  const [hlConf, setHlConf] = useState({
    account_wallet_address: "",
    agent_wallet_address: "",
    agent_private_key: "",
  });

  const { agentType } = useAgentContext();
  const { userData } = useUserContext();

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await getPrompts();
        if (response) {
          const formatPrompts = (data: Record<string, string>): IPrompt[] =>
            Object.entries(data).map(([name, prompt]) => ({ name, prompt }));

          setPlaceholderPrompts(
            formatPrompts(
              agentType === agentTypeList[0]
                ? response[agentTypeList[0]]
                : response[agentTypeList[1]]
            )
          );
          setRequiredPrompts(
            extractRequiredVariables(
              agentType === agentTypeList[0]
                ? response[agentTypeList[0]]
                : response[agentTypeList[1]]
            )
          );

          const initialPrompts =
            agentType === "trading"
              ? formatPrompts(response.trading)
              : formatPrompts(response.marketing);

          setPromptValues(
            Object.fromEntries(
              initialPrompts.map(({ name, prompt }) => [name, prompt])
            )
          );
        }
      } catch (error) {
        console.error("Error fetching prompts:", error);
      }
    };

    fetchPrompts();
  }, [agentType]);

  const prompts = useMemo(() => {
    setResearchTools([]);
    setNotifications([]);

    setPromptValues(
      Object.fromEntries(
        placeholderPrompts.map(({ name, prompt }) => [name, prompt])
      )
    );

    return placeholderPrompts;
  }, [placeholderPrompts]);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const router = useRouter();

  const { address } = useAccount();

  const maxSelections = 3;

  const handleCheckboxChange = (
    source: string,
    setSelected: any,
    selectedItems: string[]
  ) => {
    if (selectedItems.includes(source)) {
      setSelected(selectedItems.filter((s) => s !== source));
    } else if (selectedItems.length < maxSelections) {
      setSelected([...selectedItems, source]);
    }
  };

  const handleTradingInstChange = (
    source: TradingType,
    setSelected: React.Dispatch<React.SetStateAction<TradingType[]>>,
    selectedItems: TradingType[]
  ) => {
    if (selectedItems.includes(source)) {
      setSelected(selectedItems.filter((s) => s !== source));
    } else {
      setSelected([source]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setAgentPicture(file);
    } else {
      alert("Only JPG and PNG files are allowed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validatePrompts()) {
      setShowAlert(true);
      return;
    }

    setCreateLoading(true);
    const formattedPrompts = Object.entries(promptValues).map(
      ([name, prompt]) => ({
        name,
        prompt,
      })
    );

    try {
      const conf = {
        agent_name: agentName,
        model: selectedModel,
        prompts: formattedPrompts,
        agent_type: agentType,
        trading_instruments: agentType == "marketing" ? [] : tradingInst,
        research_tools: researchTools,
        notifications,
        time: selectedTimehorizon,
        metric_name: selectedMetric,
        role: agentRole,
        twitter_mention: twitterAcc,
        hyperliquid_config: hlConf,
      };

      const createAgentRes = await createAgent({
        user_id: userData.user_id,
        name: agentName,
        configuration: JSON.stringify(conf),
      });

      const res = await createSession({
        agent_id: createAgentRes.data.data.agent_id,
        ...conf,
      });
      router.push(
        `/agent/${createAgentRes.data.data.agent_id}/session/${res.data.sessionId}`
      );
    } catch (errors) {
      console.log(errors);
      alert("Internal Server Error. Please try again later.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setPromptValues((prev) => ({ ...prev, [name]: value }));
  };

  const validatePrompts = () => {
    const validationErrors: Record<string, string[]> = {};

    Object.entries(requiredPrompts).forEach(([promptName, placeholders]) => {
      if (!promptValues[promptName]) {
        validationErrors[promptName] = ["This field is required."];
      } else {
        const missingPlaceholders = placeholders.filter(
          (placeholder) => !promptValues[promptName].includes(placeholder)
        );

        if (missingPlaceholders.length > 0) {
          validationErrors[promptName] = [
            ...(validationErrors[promptName] || []),
            `Missing required: ${missingPlaceholders.join(", ")}`,
          ];
        }
      }
    });

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleHlConfChange = (k: keyof typeof hlConf, v: string) => {
    setHlConf({
      ...hlConf,
      [k]: v,
    });
  };

  return (
    <div className="pb-20 md:px-20 px-5 pt-10 bg-[linear-gradient(180deg,_rgba(23,20,7,1)_78%,_rgba(74,61,23,1)_89%,_rgba(130,110,54,1)_100%)] relative">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
        repeating-linear-gradient(transparent 0px, transparent 79px, rgba(255,255,255,0.1) 80px),
        repeating-linear-gradient(90deg, transparent 0px, transparent 79px, rgba(255,255,255,0.1) 80px)
      `,
          backgroundSize: "80px 80px",
        }}
      ></div>

      {showAlert && (
        <div className="fixed top-0 left-0 right-0 flex justify-center mt-4 z-50">
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">
              Please correct validation errors before submitting.
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-end mb-8">
        {address && (
          <div className="text-xl font-medium text-white my-2">{`${address?.slice(
            0,
            6
          )}...${address?.slice(36)}`}</div>
        )}
      </div>
      <div className="border border-[var(--primary-color)] p-6 rounded-md bg-background relative">
        <div className="absolute left-0 top-7 w-3 h-5 bg-[var(--primary-color)] rounded-r-md"></div>
        <h2 className="text-2xl font-semibold mb-8">Create Your Agent</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Agent Name */}
          <div className="flex flex-col md:flex-row md:gap-4">
            <label className="w-60 font-medium">Agent Name</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="flex-1 p-3 border rounded-md bg-transparent focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
              placeholder="Your agent name..."
              required
            />
          </div>

          {/* Agent Picture Upload */}
          <div className="flex flex-col md:flex-row md:gap-4">
            <label className="w-60 font-medium">Agent Picture</label>
            <div className="flex items-center gap-4 flex-1">
              {agentPicture ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full border overflow-hidden flex items-center justify-center">
                    <Image
                      src={URL.createObjectURL(agentPicture)}
                      alt="Agent Preview"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{agentPicture.name}</p>
                    <p className="text-xs text-gray-400">
                      {(agentPicture.size / 1024).toFixed(2)} KB
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-sm text-[var(--primary-color)] underline hover:text-opacity-80"
                      onClick={() => setAgentPicture(null)}
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex-1 border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-opacity-10 hover:border-[var(--primary-color)]">
                  <input
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <Image
                      src="/upload-image.svg"
                      alt="Upload Icon"
                      width={40}
                      height={40}
                      className="opacity-50 mb-2"
                    />
                    <div className="float:left;">
                      <span className="font-semibold text-sm text-[var(--primary-color)]">
                        Click to Upload{" "}
                      </span>
                      <span className="text-gray-500 text-sm">
                        or drag and drop
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs">
                      JPG, JPEG, PNG less than 1MB
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Dropdown Input */}
          <div className="flex flex-col md:flex-row md:gap-4">
            <label className="w-60 font-medium">Select Model</label>
            <div className="flex items-center gap-4 md:w-60 w-full">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                className="flex-1 p-3 border rounded-lg bg-transparent"
              >
                <option value="deepseek">DeepSeek</option>
                <option value="qwen">Qwen</option>
              </select>
            </div>
          </div>

          {/* Trading Instruments Checkbox Group */}
          {agentType === "trading" && (
            <div className="flex flex-col md:flex-row md:gap-4">
              <label className="w-60 font-medium">Trading Instruments</label>
              <div className="flex-1 space-y-2">
                <div>
                  <div className="flex md:grid sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1 flex-wrap">
                    {tradingList.map((source) => (
                      <label
                        key={source}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={tradingInst.includes(source)}
                          onChange={() =>
                            handleTradingInstChange(
                              source,
                              setTradingInst,
                              tradingInst
                            )
                          }
                          className="w-4 h-4"
                          style={{ accentColor: "var(--primary-color)" }}
                        />
                        <span className="capitalize leading-none">{source}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {tradingInst.includes("Hyperliquid") && (
                  <div className="mt-4">
                    <p className="mb-4 font-medium">
                      Please fill in the necessary details to enable Hyperliquid
                      trading. You can find and generate agent address & private
                      key pair on{" "}
                      <span className="underline">
                        <Link
                          href={
                            process.env.NEXT_PUBLIC_DEV_ENV == "1"
                              ? "https://app.hyperliquid-testnet.xyz/api"
                              : "https://app.hyperliquid.xyz/api"
                          }
                          target="_blank"
                        >
                          Hyperliquid API page
                        </Link>
                      </span>
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col">
                        <label>Trading account wallet address</label>
                        <input
                          type="text"
                          value={hlConf.account_wallet_address}
                          onChange={(e) =>
                            handleHlConfChange(
                              "account_wallet_address",
                              e.target.value
                            )
                          }
                          className="flex-1 p-3 border rounded-md bg-transparent focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                          required
                        />
                      </div>

                      <div className="flex flex-col">
                        <label>Trading agent wallet address</label>
                        <input
                          type="text"
                          value={hlConf.agent_wallet_address}
                          onChange={(e) =>
                            handleHlConfChange(
                              "agent_wallet_address",
                              e.target.value
                            )
                          }
                          className="flex-1 p-3 border rounded-md bg-transparent focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                          required
                        />
                      </div>

                      <div className="flex flex-col">
                        <label>Trading agent private key</label>
                        <input
                          type="text"
                          value={hlConf.agent_private_key}
                          onChange={(e) =>
                            handleHlConfChange(
                              "agent_private_key",
                              e.target.value
                            )
                          }
                          className="flex-1 p-3 border rounded-md bg-transparent focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Research Tools Checkbox Group */}
          <div className="flex flex-col md:flex-row md:gap-4">
            <label className="w-60 font-medium">Research Tools</label>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap md:grid sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                {researchTool[agentType].map((source) => (
                  <label key={source} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={researchTools.includes(source)}
                      onChange={() =>
                        handleCheckboxChange(
                          source,
                          setResearchTools,
                          researchTools
                        )
                      }
                      disabled={
                        researchTools.length >= maxSelections &&
                        !researchTools.includes(source)
                      }
                      className="w-4 h-4"
                      style={{ accentColor: "var(--primary-color)" }}
                    />
                    <span className="leading-none">{source}</span>
                  </label>
                ))}
              </div>
              {agentType === "trading" && (
                <div className="text-sm italic text-[var(--primary-color)]">
                  *Pick up to 3 research tools
                </div>
              )}
            </div>
          </div>

          {/* Notifications Checkbox Group */}

          <div className="flex flex-col md:flex-row md:gap-4">
            <label className="w-60 font-medium">Notifications</label>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap md:grid sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                {Object.entries(notifToolList[agentType]).map(([k, v]) => (
                  <label key={k} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={notifications.includes(k as NotifType)}
                      onChange={() =>
                        handleCheckboxChange(k, setNotifications, notifications)
                      }
                      disabled={
                        notifications.length >= maxSelections &&
                        !notifications.includes(k as NotifType)
                      }
                      className="w-4 h-4"
                      style={{ accentColor: "var(--primary-color)" }}
                    />
                    <span className="leading-none">{v}</span>
                  </label>
                ))}
              </div>
              <div className="text-sm italic text-[var(--primary-color)]">
                *Pick up to 3 notification tools
              </div>
            </div>
          </div>

          {/* Twitter account */}
          {notifications.includes("twitter_mentions") && (
            <div className="flex flex-col md:flex-row md:gap-4">
              <label className="w-60 font-medium">Twitter @s</label>
              <input
                type="text"
                value={twitterAcc}
                onChange={(e) => setTwitterAcc(e.target.value)}
                className="flex-1 p-3 border rounded-md bg-transparent focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                placeholder="Account URL"
                required
              />
            </div>
          )}

          <div className="flex flex-col md:flex-row md:gap-4">
            <label className="w-60 font-medium">Time Horizon</label>
            <div className="flex items-center gap-4 md:w-60 w-full">
              <select
                value={selectedTimehorizon}
                onChange={(e) =>
                  setSelectedTimehorizon(e.target.value as string)
                }
                className="flex-1 p-3 border rounded-lg bg-transparent"
              >
                {timehorizonList.map((timeHorizon, index) => (
                  <option key={index} value={timeHorizon}>
                    {timeHorizon}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:gap-4">
            <label className="w-60 font-medium">Metric</label>
            <div className="flex items-center gap-4 md:w-60 w-full">
              <select
                value={selectedMetric}
                onChange={(e) =>
                  setSelectedMetric(e.target.value as MetricsType)
                }
                className="flex-1 p-3 border rounded-lg bg-transparent"
              >
                {Object.entries(metricList[agentType]).map((value, index) => (
                  <option key={index} value={value[1]}>
                    {value[0]
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prompt Inputs */}
          <div className="flex flex-col md:flex-row md:gap-4">
            <label className="w-60 font-medium">Role Prompt</label>
            <textarea
              value={agentRole}
              onChange={(e) => setAgentRole(e.target.value)}
              className="flex-1 p-3 border rounded-md bg-transparent focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
              required
            />
          </div>

          {/* Prompt Inputs */}
          <div className="flex flex-col gap-8 w-full">
            {prompts.length > 0 &&
              prompts.map(({ name }: { name: string }, index) => (
                <div className="flex flex-col md:flex-row md:gap-4" key={index}>
                  <label className="w-60 font-medium">
                    {name
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char: string) => char.toUpperCase())}
                  </label>
                  <div className="flex-1 space-y-2">
                    <textarea
                      className={`flex w-full p-3 border rounded-md bg-transparent 
                    ${errors[name]
                          ? "border-red-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                          : "focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                        }
                    `}
                      // focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]
                      value={promptValues[name]}
                      onChange={(e) => handleChange(name, e.target.value)}
                      rows={6}
                    />
                    {errors[name] && (
                      <div className="text-red-500 text-sm">{errors[name]}</div>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Fund top-up */}
          <div className="flex flex-col md:flex-row md:gap-4 text-gray-500">
            <label className="w-60 font-medium">Fund top-up</label>
            <div className="flex flex-wrap gap-6">
              <input
                type="text"
                className="flex-1 p-3 border rounded-lg bg-transparent border-gray-500 w-60"
                placeholder="Add funds to your account..."
                disabled
              />
              <button
                className="bg-[var(--primary-color)] text-white px-10 py-3 rounded-md hover:bg-opacity-80 hover:brightness-110 disabled:bg-gray-500 disabled:opacity-50"
                disabled
              >
                Pay
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="bg-[var(--primary-color)] text-white px-12 py-3 rounded-md hover:bg-opacity-80 hover:brightness-110 disabled:bg-gray-500 disabled:opacity-50"
              disabled={createLoading}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
