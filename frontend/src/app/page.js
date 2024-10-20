"use client";

import { motion } from "framer-motion";

import Typewriter from "typewriter-effect";

import Image from "next/image";
import Link from "next/link";

import { useState } from "react";

import Navigation from "@/components/navigation/Navigation.js";

import landing from "@/media/landing.png";
import logoWhite from "@/media/logo-white.png";

export default function Page() {
  const [prompt, setPrompt] = useState("");

  return (
    <div>
      <Navigation />
      <div className="w-screen translate-y-[25vh] flex flex-col justify-center items-center">
        <div className="font-semibold text-6xl text-purpleLight mb-7 flex items-end">
          &nbsp;
          <Typewriter
            onInit={(typewriter) => {
              typewriter
                .pauseFor(1000)
                .typeString("I want to learn about the human mind.")
                .pauseFor(2500)
                .deleteChars(16)
                .pauseFor(200)
                .typeString(" creative writing.")
                .pauseFor(2500)
                .deleteChars(18)
                .pauseFor(200)
                .typeString(" music history.")
                .pauseFor(2500)
                .deleteAll()
                .pauseFor(200)

                .typeString("Give me a lesson on linked lists.")
                .pauseFor(2500)
                .deleteChars(14)
                .pauseFor(200)
                .typeString(" protein synthesis.")
                .pauseFor(2500)
                .deleteChars(19)
                .pauseFor(200)
                .typeString(" thermodynamics.")
                .pauseFor(2500)
                .deleteAll()
                .pauseFor(200)

                .typeString("Show me the process of launching a new product.")
                .pauseFor(2500)
                .deleteChars(25)
                .pauseFor(200)
                .typeString(" deploying an EC2 instance.")
                .pauseFor(2500)
                .deleteChars(27)
                .pauseFor(200)
                .typeString(" training a neural network.")
                .pauseFor(2500)
                .deleteAll()
                .start();
            }}
            options={{
              loop: true,
              delay: 50,
              deleteSpeed: 30,
            }}
          />&nbsp;
        </div>
        <div className="flex gap-4 mb-4">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What would you like to learn today?"
            className="w-[600px] p-3 rounded-full text-lg px-6"
          />
          <button
            onClick={() => {}}
            className="text-lg p-3 bg-purpleLight rounded-full duration-200 hover:bg-white hover:shadow-xl px-5 disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:shadow-none"
            disabled={!prompt}
          >
            Let's go!
          </button>
        </div>
        <div>
          <Image src={logoWhite} alt="logo" className="w-20" />
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Image
          src={landing}
          alt="landing design"
          className="absolute w-screen bottom-0"
        />
      </motion.div>
    </div>
  );
}
