import micOnImage from "@/media/mic-on.png";
import micOffImage from "@/media/mic-off.png";
import vidOnImage from "@/media/vid-on.png";
import vidOffImage from "@/media/vid-off.png";

import {
  LocalUser,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
} from "agora-rtc-react";

import Image from "next/image";

import { useState } from "react";

export default function LocalUserComponent() {
  // Local user
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  usePublish([localMicrophoneTrack, localCameraTrack]);

  return (
    <div className="rounded-lg overflow-hidden bg-white w-[200px] h-fit">
      <div className="rounded-lg overflow-hidden h-[120px]">
        <LocalUser
          audioTrack={localMicrophoneTrack}
          cameraOn={cameraOn}
          micOn={micOn}
          videoTrack={localCameraTrack}
        />
      </div>
      <div className="flex px-3 justify-between items-center py-[3px]">
        <p className="text-sm">You</p>

        <div className="flex items-center">
          <button
            onClick={() => setMic(!micOn)}
            className="p-1 rounded-full hover:bg-gray-300 duration-200"
          >
            <Image src={micOn ? micOnImage : micOffImage} className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCamera(!cameraOn)}
            className="p-1 rounded-full hover:bg-gray-300 duration-200"
          >
            <Image
              src={cameraOn ? vidOnImage : vidOffImage}
              className="w-4 h-4"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
