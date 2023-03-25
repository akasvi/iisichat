import React, { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";
import SilenceDetection from "../SilenceDetection";

const AudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  const speak = (text) => {
    axiosInstance.post("/speak", { text });
  };

  const startRecording = async () => {
    try {
      let audioCtx = audioContext;
      if (!audioCtx) {
        audioCtx = new AudioContext();
        setAudioContext(audioCtx);
      }
      await audioCtx.resume();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const silenceDetector = new SilenceDetection(
        audioCtx,
        () => {
          stopRecording();
          startRecording();
        },
        5000
      );

      recorder.ondataavailable = async (e) => {
        try {
          const arrayBuffer = await e.data.arrayBuffer();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          silenceDetector.process(audioBuffer);
          setChunks((chunks) => [...chunks, e.data]);
        } catch (error) {
          console.error("Error decoding audio data:", error);
        }
      };

      recorder.onstop = async () => {
        setProcessing(true);
        const blob = new Blob(chunks, { type: "audio/wav" });
        setChunks([]);
        await sendAudioToServer(blob);
        setProcessing(false);
      };

      recorder.start();

      setMediaStream(stream);
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToServer = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.wav");

      const response = await axiosInstance.post("/process-audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const responseText = response.data;
      speak(responseText);
    } catch (error) {
      console.error("Error sending audio to server:", error);
    }
  };

  return (
    <div>
      <button onClick={startRecording} disabled={isRecording}>
        Start
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop
      </button>
      {processing && <p>Processing...</p>}
    </div>
  );
};

export default AudioRecording;
