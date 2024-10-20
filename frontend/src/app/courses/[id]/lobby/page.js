"use client";

import Link from "next/link"

import Dictaphone from "../classroom/VoiceToText";

import LocalUserComponent from "./LocalUserComponent";
import RemoteUserComponent from "./RemoteUserComponent";

import { useParams, useRouter } from "next/navigation";

import { CaretLeftIcon } from "@radix-ui/react-icons";

import React, { useState, useEffect } from "react";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";

import { appId, channelName, token } from "@/components/agora/data";

import { CopyIcon } from "@radix-ui/react-icons";

import { useJoin, useRemoteUsers } from "agora-rtc-react";

export default Dictaphone

function Page() {
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  return (
    <AgoraRTCProvider client={client}>
      <Lobby />
    </AgoraRTCProvider>
  );
}

function Lobby() {
  const { id } = useParams();
  const router = useRouter();

  const [showPopup, setShowPopup] = useState(false);

  const [calling, setCalling] = useState(true); // Is calling

  useJoin(
    { appid: appId, channel: channelName, token: token ? token : null },
    calling
  );

  // Remote user
  const remoteUsers = useRemoteUsers();

  const handleButtonClick = () => {
    navigator.clipboard.writeText(
      `localhost:3000/courses/${id}/lobby?channel=${channelName}&token=${token}`
    );

    setShowPopup(true);

    // Hide the popup after 2 seconds
    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  const getCourseName = (str) => {
    if (str == "data_structures") {
      return "Data Structures"
    }
    else if (str == "queues") {
      return "Queues"
    }
    else if (str == "stacks") {
      return "Stacks"
    }
    return str
  }

  return (
    <div className="w-screen h-screen grid grid-cols-2 text-lg">
      <button
        onClick={() => router.back()}
        className="absolute rounded-full hover:bg-gray-300 hover:cursor-pointer p-2 duration-200  translate-x-[20px] translate-y-[20px]"
      >
        <CaretLeftIcon className="w-6 h-6 text-black" />
      </button>

      {/* Left Side */}
      <div className="bg-gradient-to-r from-white to-[#DADADA] flex flex-col items-center justify-center">
        <div>
          <div className="mb-[25px]">
            <p>Lesson topic:</p>
            <h1 className="font-bold text-4xl">Intro to {getCourseName(id)}</h1>
          </div>

          <div className="mb-[40px]">
            <p className="underline underline-offset-4 mb-1">Schedule</p>
            <div className="w-[35svh] [&>*]:leading-6">
              <ScheduleItem item="Classification of Data Structures" time="1" />
              <ScheduleItem item="Introducing Queue" time="1" />
              <ScheduleItem item="Introducing Stack" time="1" />
              <ScheduleItem item="Q&A" time="2" />
            </div>
          </div>

          <div className="text-end">
            <p className="leading-6">Total estimated duration</p>
            <h2 className="font-bold text-3xl">5 min.</h2>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div>
        <div className="flex flex-wrap gap-5 py-[120px] justify-center gap-y-4 h-fit ">
          <LocalUserComponent />
          {remoteUsers.map((user) => (
            <RemoteUserComponent key={user.uid} user={user} />
          ))}
        </div>
        <div className="flex justify-center mb-[20px]">
          <div className="text-white">
            <h3 className="font-semibold text-2xl">Invite your friends!</h3>
            <p className="mb-3">
              Send them the classmate invite link below to add your friends.
            </p>
            <div className="relative flex gap-1 items-center bg-white text-purple3 rounded-full justify-between w-[50svh] px-4 py-1 text-sm">
              <p
                className="truncate w-[50svh]"
                styles={{ textOverflow: "clip" }}
              >
                localhost:3000/courses/{id}/lobby?channel={channelName}
                &token={token}
              </p>
              <button
                className=" rounded-full hover:bg-gray-300 duration-200 p-2"
                onClick={handleButtonClick}
              >
                <CopyIcon className="w-4 h-4" />
              </button>
              <p className={`transition-all absolute right-[-20px] top-[-40px] bg-white rounded-lg py-1 px-3 ${showPopup ? "opacity-100" : "opacity-0"}`}>
                Copied to clipboard!
              </p>
            </div>
          </div>
        </div>

          <div className="flex justify-center">
          <Link href={`/courses/${id}/classroom`} className="transition-all duration-300 text-xl font-semibold bg-gradient-to-r to-purple1 via-purple3 from-purple2 bg-size-200 disabled:border-purple2 hover:bg-pos-100 px-4 py-2 rounded-full border-2 border-white text-white disabled:text-gray-400 disabled:pointer-events-none hover:drop-shadow-[0_0_10px_rgba(255,255,255,.75)]" disabled={!prompt}>Begin Lesson</Link>

          </div>

      </div>
    </div>
  );
}

function ScheduleItem({ item, time }) {
  return (
    <div className="flex justify-between">
      <p>{item}</p>
      <p>~{time} min.</p>
    </div>
  );
}
