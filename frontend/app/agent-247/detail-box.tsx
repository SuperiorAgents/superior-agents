import { useState } from "react";
// import { useAccount, useBalance } from "wagmi";
import moment from "moment";
import { AGENT_247_WALLET } from "@/helpers/constants";

const DetailItem = ({
  title,
  value,
}: {
  title: string;
  value: string | string[];
}) => {
  const formatValue = (value: string) => {
    const regex = /([-+]\d+(\.\d+)?%)/;
    const match = value.match(regex);

    if (match) {
      const percentage = match[0];
      const beforePercentage = value.replace(percentage, "").trim();

      return (
        <>
          {beforePercentage}{" "}
          <span
            className={
              percentage.startsWith("+") ? "text-green-500" : "text-red-500"
            }
          >
            {percentage}
          </span>
        </>
      );
    }

    return value;
  };

  return (
    <div className="flex flex-col">
      <span className="text-gray-400 text-sm">{title}</span>
      {Array.isArray(value) ? (
        <div className="flex flex-wrap gap-4">
          {value.map((item, index) => (
            <span key={index} className="font-bold text-white">
              ▪ {item}
            </span>
          ))}
        </div>
      ) : (
        <span className=" text-white font-bold">{formatValue(value)}</span>
      )}
    </div>
  );
};

const PromptDetail = ({ title, value }: { title: string; value: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <span className="text-gray-400 text-sm">{title}</span>
      <button
        onClick={() => setIsOpen(true)}
        className="text-white font-bold text-xs underline hover:opacity-70 w-max"
      >
        See details
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="bg-black p-6 rounded-lg max-w-xl w-full text-white border border-gray-600">
            <h2 className="text-lg font-bold border-b border-gray-600 pb-2">
              {title}
            </h2>
            <div className="mt-4 text-gray-300 whitespace-pre-wrap">
              {value}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const DetailBox = ({ config }: { config: any }) => {
  // const { address } = useAccount();
  // const result = useBalance({
  //   address: "0x09E447C4f72FACF0bD1d256e95Ae1DB91C776D88",
  // })

  // console.log(result)

  return (
    <div className="flex flex-col gap-4 border border-[var(--primary-color)] p-6 rounded-md relative overflow-auto max-h-[912px]">
      <DetailItem
        title="Allive since"
        value={moment(config?.created_at).format("DD MMM YYYY, HH:mm") || "-"}
      />
      <DetailItem
        title="Wallet"
        value={
          `${AGENT_247_WALLET.slice(0, 6)}...${AGENT_247_WALLET?.slice(36)}` ||
          "-"
        }
      />
      <DetailItem title="Wallet Balance" value={config?.balance || "-"} />
      <DetailItem title="No of Trades" value={config?.no_of_trades || "-"} />
      <DetailItem title="No of Cycles" value={config?.cycles || "-"} />
      <DetailItem title="Model" value={config?.configuration.model || "-"} />
      <DetailItem
        title="Trading Instruments"
        value={config?.configuration.trading_instruments || "-"}
      />
      <DetailItem title="Metric" value={config?.configuration.metric || "-"} />
      <DetailItem
        title="Time Horizon"
        value={config?.configuration.time_horizon || "-"}
      />

      <PromptDetail title="Role Prompt" value={config?.configuration.role} />
      {config?.configuration?.prompts.map((prompt: any, index: number) => (
        <PromptDetail
          key={index}
          title={prompt.name
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char: any) => char.toUpperCase())}
          value={prompt.prompt}
        />
      ))}
    </div>
  );
};
