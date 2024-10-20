"use client";

import { useState } from "react";
import { appId, channelName, token } from "@/components/agora/data";

import { useJoin, useRemoteUsers } from "agora-rtc-react";

import LocalUserComponent from "../lobby/LocalUserComponent";
import RemoteUserComponent from "../lobby/RemoteUserComponent";

import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";

import { CaretDownIcon, CaretRightIcon } from "@radix-ui/react-icons";

export default function Page() {
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  return (
    <AgoraRTCProvider client={client}>
      <Classroom />
    </AgoraRTCProvider>
  );
}

function Classroom() {
  const [stageIndex, setStateIndex] = useState(0);
  const [sectionList, setSectionList] = useState(null);

  // ------ AGORA -------
  const [calling, setCalling] = useState(true);
  useJoin(
    { appid: appId, channel: channelName, token: token ? token : null },
    calling
  );
  const remoteUsers = useRemoteUsers();
  // ------ AGORA -------

  // ------ COMPONENTS -------
  const [camerasVisible, setCamerasVisible] = useState(true);
  // ------ COMPONENTS -------


  return (
    <div className="w-screen flex justify-between">
      <div></div>
      <div className="absolute bomax-w-[600px] bg-black text-white text-sm bottom-[30px]">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </div>

      <div
        className="py-[30px] pr-[30px]"
      >
        <button onClick={() => setCamerasVisible(!camerasVisible)} className="w-fit">
          {camerasVisible ? (
            <CaretRightIcon className="w-5 h-5 text-purple3" />
          ) : (
            <CaretDownIcon
              className="w-5 h-5 text-purple3"
            />
          )}
        </button>
        <div className={`flex flex-col gap-2 j-fit ${camerasVisible ? "visible" : "invisible"}`}>
        <LocalUserComponent />
        {remoteUsers.map((user) => (
          <RemoteUserComponent key={user.uid} name={user.uid} />
        ))}
        </div>
        
      </div>
    </div>
  );
}
