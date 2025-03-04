"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useState } from "react";
import { agentTypeList, useAgentContext } from "@/provider/agent";
import { AgentType } from "@/repository/interface";
// import { signIn, signOut, useSession } from "next-auth/react";

export default function Homepage() {
  // const { data: session, update } = useSession();
  const [isOpen, setIsOpen] = useState(false)
  const { setAgentType } = useAgentContext()

  return (
    <div
      className="flex min-h-screen justify-center items-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/background.webp')",
        backgroundSize: "60%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex flex-col items-center text-center px-6 space-y-4">
        <Image
          src="/superior-agent.svg"
          alt="Superior Agents Logo"
          width={200}
          height={100}
        />
        <h1 className="text-4xl font-bold text-white">
          Empower KoLs With{" "}
          <span className="text-[var(--primary-color)]">
            Smart Trading Bots
          </span>
        </h1>
        <p className="text-lg text-gray-300 max-w-xl">
          A platform designed for select KoLs to build, test, <br /> and deploy
          their own trading bots.
        </p>

        {/* Enter App Button */}
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <>
              <button
                onClick={() => setIsOpen(true)}
                className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-md flex items-center gap-2 hover:brightness-110 transition"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.25 6H5.25C5.05109 6 4.86032 5.92098 4.71967 5.78033C4.57902 5.63968 4.5 5.44891 4.5 5.25C4.5 5.05109 4.57902 4.86032 4.71967 4.71967C4.86032 4.57902 5.05109 4.5 5.25 4.5H18C18.1989 4.5 18.3897 4.42098 18.5303 4.28033C18.671 4.13968 18.75 3.94891 18.75 3.75C18.75 3.55109 18.671 3.36032 18.5303 3.21967C18.3897 3.07902 18.1989 3 18 3H5.25C4.65326 3 4.08097 3.23705 3.65901 3.65901C3.23705 4.08097 3 4.65326 3 5.25V17.25C3 17.8467 3.23705 18.419 3.65901 18.841C4.08097 19.2629 4.65326 19.5 5.25 19.5H20.25C20.6478 19.5 21.0294 19.342 21.3107 19.0607C21.592 18.7794 21.75 18.3978 21.75 18V7.5C21.75 7.10218 21.592 6.72064 21.3107 6.43934C21.0294 6.15804 20.6478 6 20.25 6ZM16.875 13.5C16.6525 13.5 16.435 13.434 16.25 13.3104C16.065 13.1868 15.9208 13.0111 15.8356 12.8055C15.7505 12.6 15.7282 12.3738 15.7716 12.1555C15.815 11.9373 15.9222 11.7368 16.0795 11.5795C16.2368 11.4222 16.4373 11.315 16.6555 11.2716C16.8738 11.2282 17.1 11.2505 17.3055 11.3356C17.5111 11.4208 17.6868 11.565 17.8104 11.75C17.934 11.935 18 12.1525 18 12.375C18 12.6734 17.8815 12.9595 17.6705 13.1705C17.4595 13.3815 17.1734 13.5 16.875 13.5Z"
                    fill="currentColor"
                  />
                </svg>
                Enter App
              </button>
              {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
                    <h2 className="text-xl text-black font-semibold mb-4">
                      Select Agent Type
                    </h2>
                    <div className="space-y-3">
                      {agentTypeList.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setAgentType(type as AgentType);
                            setIsOpen(false);
                            openConnectModal();
                          }}
                          className="w-full px-4 py-2 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-md hover:bg-[var(--primary-color)] hover:text-white transition"
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </ConnectButton.Custom>

        {/* <div className="flex flex-row items-center space-x-2">
          {session ? (
            <>
              <h1 className="text-xl font-bold text-white">
                Welcome,{" "}
                <span className="text-[var(--primary-color)]">
                  {session.user?.name}
                </span>
              </h1>
              <button
                className="flex items-center border-white border bg-black text-white text-sm py-1 px-2 rounded-md hover:bg-gray-900"
                onClick={() => signOut({ redirect: false }).then(() => update({ session: null }))}
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              className="flex items-center gap-2 bg-black border-white border text-white px-6 py-2 rounded-md hover:bg-gray-900"
              onClick={() => signIn("twitter")}
            >
              Sign in with
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M214.75,211.71l-62.6-98.38,61.77-67.95a8,8,0,0,0-11.84-10.76L143.24,99.34,102.75,35.71A8,8,0,0,0,96,32H48a8,8,0,0,0-6.75,12.3l62.6,98.37-61.77,68a8,8,0,1,0,11.84,10.76l58.84-64.72,40.49,63.63A8,8,0,0,0,160,224h48a8,8,0,0,0,6.75-12.29ZM164.39,208,62.57,48h29L193.43,208Z"></path></svg>
            </button>
          )}
        </div> */}

        <div className="flex items-center w-full max-w-md">
          <div className="flex-1 h-[1px] bg-white"></div>
          <span className="px-4 ">OR</span>
          <div className="flex-1 h-[1px] bg-white"></div>
        </div>

        <input
          disabled
          type="text"
          placeholder="Got an invite? Enter code here..."
          className="w-full max-w-md p-2 border rounded-md bg-white text-black placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
        />
      </div>
    </div >
  );
}
