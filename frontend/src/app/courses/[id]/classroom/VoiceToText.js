import React from "react";
import { useVoiceToText } from "react-speakup";

const VoiceToText = () => {
  const { startListening, stopListening, transcript } = useVoiceToText({
    continuous: true,
    lang: "en-US",
  });

  return (
    <div className="flex flex-col gap-6">
      {" "}
      <div className="flex gap-6">
        <button onClick={startListening}>start</button>
        <button onClick={stopListening}>stop</button>
      </div>
      <h2>{transcript}</h2>
    </div>
  );
};

export default VoiceToText;