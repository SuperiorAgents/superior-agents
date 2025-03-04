"use client";

import React from "react";

export const DiaryBox = () => {

  return (
    <div className="border border-[var(--primary-color)] p-6 rounded-md relative">
      <div className="absolute left-0 top-7 w-3 h-5 bg-[var(--primary-color)] rounded-r-md"></div>
      <h1 className="text-xl font-semibold mb-4">Agent Diary</h1>
      <div className="px-5 py-3 h-[200px] overflow-scroll text-green-600">
        {/* <ul>
          {messages.map((msg, index) => (
            <li key={index} className="p-2 rounded font-[var(--font-mono)]">
              <pre className="whitespace-pre-wrap">{msg}</pre>
            </li>
          ))}
        </ul> */}
      </div>
      {/* <button className="bg-[var(--primary-color)] text-sm py-2 px-4 rounded-md mt-4 font-semibold">
        Twitter
      </button> */}
    </div>
  );
};
