"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Navigation from "@/components/navigation/Navigation";

export default function Page() {
  const [prompt, setPrompt] = useState("");

    const getParam = (str) => {
        str = str.toLowerCase()
        let param = str;
        if (str.includes("data".toLowerCase()) && str.includes("structures".toLowerCase())) {
          param = "data_structures"
        } else if (str.includes("stacks".toLowerCase())) {
            param = "stacks"
        } else if (str.includes("queues".toLowerCase())) {
            param = "queues"
        }
        return param
    }


  return (
    <div>
      <Navigation />
      <div className="mx-[150px] mt-[100px]">
        <h2 className="font-semibold text-3xl text-white">Create new course</h2>
        <p className="text-lg font-light text-purpleLight mb-4">
          Enter a topic and generate your course within minutes!
        </p>
        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What would you like to learn today?"
            className=" mb-6 rounded-lg text-lg px-4 py-3 w-[600px] h-[200px] bg-white"
          />
        </div>
        {
            prompt ? <a
            href={`/courses/${getParam(prompt)}/lobby`}
            className="transition-all duration-300 bg-gradient-to-r to-purple1 via-purple3 from-purple2 bg-size-200 disabled:border-purple2 hover:bg-pos-100 px-4 py-2 rounded-full border-2 border-white text-white disabled:text-gray-400 disabled:pointer-events-none hover:drop-shadow-[0_0_10px_rgba(255,255,255,.75)]"
          >
            Create
          </a>
          : <button
          href={`/courses/${getParam(prompt)}/lobby`}
          className="transition-all duration-300 bg-gradient-to-r to-purple1 via-purple3 from-purple2 bg-size-200 disabled:border-purple2 hover:bg-pos-100 px-4 py-2 rounded-full border-2 border-white text-white disabled:text-gray-400 disabled:pointer-events-none hover:drop-shadow-[0_0_10px_rgba(255,255,255,.75)]"
            disabled
        >
          Create
        </button>
        }
        
      </div>
    </div>
  );
}
