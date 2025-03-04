"use client";

// import { useAccount } from "wagmi";
import { LogsBox } from "./logs-box";
import { useEffect, useState } from "react";
import { AGENT_247_ID } from "@/helpers/constants";
// import { useGetWalletTxs } from "@/hooks/etherscan";
import { DetailBox } from "./detail-box";
import { DiaryBox } from "./diary-box";
import Image from "next/image";
// import { IAgentData } from "@/repository/interface";
import { getAgent } from "@/repository/agent";

const agentPicture = "";

export const LiveAgentsPage = () => {
  // const { address } = useAccount();
  // const [currentPage, setCurrentPage] = useState(1);
  // const transactionsPerPage = 10;

  // const { data, isLoading } = useGetWalletTxs(AGENT_247_WALLET);
  const [agent, setAgent] = useState<any | null>(null);

  // const transactions = useMemo(() => {
  //   return data?.data.result || [];
  // }, [data?.data]);

  // Pagination Logic
  // const indexOfLastTransaction = currentPage * transactionsPerPage;
  // const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  // const currentTransactions = transactions.slice(
  //   indexOfFirstTransaction,
  //   indexOfLastTransaction
  // );

  // const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await getAgent({ agent_id: AGENT_247_ID as string });
        if (response.status === "success") {
          const agentData = response.data;
          const parsedConfig = JSON.parse(agentData.configuration);
          setAgent({
            ...agentData,
            configuration: parsedConfig,
          });
        } else {
          throw new Error("Failed to fetch agent data.");
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchAgent();
  }, [AGENT_247_ID]);

  return (
    <div className="bg-[#171307] min-h-screen flex flex-col items-center">
      <div className="text-white px-6 py-4 max-w-screen-2xl text-xl font-bold justify-self-center w-full">
        Superior Agents
      </div>

      <div className="relative w-full">
        <Image
          src="/hero.webp"
          alt="Hero Image"
          layout="responsive"
          width={1600}
          height={600}
          className="object-cover"
        />
      </div>

      <div className="text-white text-center py-6 px-4 mt-4">
        <h1 className="text-xl md:text-3xl font-semibold">
          We are building agents that can act autonomously and self-learn
        </h1>
        <h2 className="text-xl md:text-3xl font-bold mt-2">
          These are{" "}
          <span className="text-[var(--primary-color)]">SUPERIOR AGENTS</span>
        </h2>
      </div>

      <div className="flex flex-col gap-6 p-6 max-w-screen-2xl justify-self-center w-full">
        <div className="w-full flex flex-col sm:flex-row items-center sm:items-start">
          <div className="flex justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center border-2 border-[var(--primary-color)]">
                <Image
                  src={
                    agentPicture
                      ? URL.createObjectURL(agentPicture)
                      : process.env.NEXT_PUBLIC_DEV_ENV == "1"
                      ? "/agent-2-default-pfp.jpg"
                      : "/agent-default-pfp.jpg"
                  }
                  alt="Agent Avatar"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {agent?.name || "Agent Name"}
                </h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-1">
                  {agent?.configuration.research_tools.map((tool: any) => (
                    <span
                      key={tool}
                      className="px-3 py-1 text-sm bg-[var(--primary-color)] bg-opacity-75 rounded-md"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col gap-6 w-full md:w-2/3">
            <div className="flex-1 bg-[#151003] overflow-auto">
              <LogsBox sessionId={AGENT_247_ID} />
            </div>

            <div className="bg-[#151003] overflow-auto">
              <DiaryBox />
            </div>
          </div>

          <div className="w-full md:w-1/3 bg-[#151003] flex-1 min-h-[500px] md:min-h-[500px] overflow-auto">
            <DetailBox config={agent} />
          </div>
        </div>
      </div>
    </div>
  );
};

// <div className="border max-w-screen-2xl p-4 md:p-10 w-full justify-self-center">
//   <div className="flex flex-col gap-4 w-full border p-4 rounded-lg border-[var(--primary-color)] ">
//     <div className="flex flex-wrap gap-2 sm:gap-4 p-4 text-[#826E36] items-start bg-[#151003]">
//       <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <g clipPath="url(#clip0_101_2009)">
//           <path d="M20.431 1.57074H1.57251C0.701362 1.57074 0 2.27388 0 3.14414V18.8585C0 19.7253 0.701362 20.4293 1.57251 20.4293H20.431C21.296 20.4293 22 19.7253 22 18.8585V3.14414C22.0009 2.27388 21.2969 1.57074 20.431 1.57074ZM7.51675 2.75123C7.94699 2.75123 8.29989 3.10325 8.29989 3.53793C8.29989 3.97084 7.9461 4.32285 7.51675 4.32285C7.08206 4.32285 6.72649 3.97084 6.72649 3.53793C6.72738 3.10236 7.08118 2.75123 7.51675 2.75123ZM5.10865 2.75123C5.54156 2.75123 5.89357 3.10325 5.89357 3.53793C5.89357 3.97084 5.54156 4.32285 5.10865 4.32285C4.67397 4.32285 4.32017 3.97084 4.32017 3.53793C4.32017 3.10236 4.67397 2.75123 5.10865 2.75123ZM2.74944 2.75123C3.18235 2.75123 3.53614 3.10325 3.53614 3.53793C3.53614 3.97084 3.18235 4.32285 2.74944 4.32285C2.31743 4.32285 1.96452 3.97084 1.96452 3.53793C1.96541 3.10236 2.31832 2.75123 2.74944 2.75123ZM1.57251 5.51757H20.431C20.431 5.51757 20.431 11.4378 20.431 15.2726H15.2406L13.9366 12.9614L12.8859 14.7668L11.468 7.26875L9.9204 14.4753L9.34793 12.6601L8.42256 16.0513L7.31763 12.7943L6.2447 15.0273H1.57251V5.51757ZM20.431 18.8594H1.57251V15.454H6.60293L7.2314 14.141L8.47945 17.815L9.38438 14.4904L10.0146 16.4958L11.436 9.89285L12.6281 16.2078L13.9303 13.9677L14.9055 15.7002H20.4302C20.431 16.8425 20.431 18.8594 20.431 18.8594Z" fill="currentColor" />
//         </g>
//         <defs>
//           <clipPath id="clip0_101_2009">
//             <rect width="22" height="22" fill="white" />
//           </clipPath>
//         </defs>
//       </svg>

//       <span className="text-2xl font-bold leading-none">Chain of Thought</span>
//       <span className="text-white text-2xl font-bold leading-none">/ Agent Name</span>
//     </div>

//     <div className="flex flex-row gap-8 md:gap-4 items-stretch">
//       <div className="w-full md:w-2/3">
//         <LogsBox sessionId={AGENT_247_ID} agentName={"Agent247"} />
//       </div>
//       <div className="w-full md:w-1/3">
//         <DetailBox />
//       </div>
//     </div>

//     {isLoading ? (
//       <div className="mt-4">Loading Transactions</div>
//     ) : (
//       <div>
//         <h2 className="text-2xl font-bold leading-none my-4">Transaction History</h2>
//         <div className="border border-[var(--primary-color)] p-6">
//           <table className="w-full border border-[var(--primary-color)]">
//             <thead className="border border-[var(--primary-color)]">
//               <tr>
//                 <th className="p-2 text-left">Block</th>
//                 <th className="p-2 text-left">Hash</th>
//                 <th className="p-2 text-left">From</th>
//                 <th className="p-2 text-left">To</th>
//                 <th className="p-2 text-left">Value (ETH)</th>
//                 <th className="p-2 text-left">Time</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentTransactions.length > 0 ? (
//                 currentTransactions.map((tx: any) => (
//                   <tr
//                     key={tx.hash}
//                     className="border border-[var(--primary-color)]"
//                   >
//                     <td className="p-2">{tx.blockNumber}</td>
//                     <td className="p-2">{tx.hash.slice(0, 10)}...</td>
//                     <td className="p-2">{tx.from.slice(0, 10)}...</td>
//                     <td className="p-2">{tx.to.slice(0, 10)}...</td>
//                     <td className="p-2">{(tx.value / 1e18).toFixed(4)}</td>
//                     <td className="p-2">
//                       {new Date(tx.timeStamp * 1000).toLocaleString()}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={6} className="text-center p-4">
//                     No transactions found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     )}

//     {/* Pagination */}
//     {transactions.length > transactionsPerPage && (
//       <div className="flex items-center justify-center mt-4 space-x-2">
//         <button
//           onClick={() => paginate(1)}
//           disabled={currentPage === 1}
//           className="bg-[var(--primary-color)] text-white px-3 py-1 rounded-md flex items-center gap-2 hover:brightness-110 transition disabled:bg-gray-500"
//         >
//           First
//         </button>

//         <button
//           onClick={() => paginate(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="px-3 py-1 rounded-lg border disabled:bg-gray-500"
//         >
//           &lt;
//         </button>

//         <div className="px-4 py-1 border rounded-lg">
//           Page {currentPage} of{" "}
//           {Math.ceil(transactions.length / transactionsPerPage)}
//         </div>

//         <button
//           onClick={() => paginate(currentPage + 1)}
//           disabled={
//             currentPage ===
//             Math.ceil(transactions.length / transactionsPerPage)
//           }
//           className="px-3 py-1 rounded-lg border disabled:bg-gray-500"
//         >
//           &gt;
//         </button>

//         <button
//           onClick={() =>
//             paginate(Math.ceil(transactions.length / transactionsPerPage))
//           }
//           disabled={
//             currentPage ===
//             Math.ceil(transactions.length / transactionsPerPage)
//           }
//           className="bg-[var(--primary-color)] text-white px-3 py-1 rounded-md flex items-center gap-2 hover:brightness-110 transition disabled:bg-gray-500"
//         >
//           Last
//         </button>
//       </div>
//     )}
//   </div>
// </div>
