require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { exec } = require("child_process");
const axios = require("axios");
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 3007;

app.use(express.json());
app.use(cors());

const getFetch = require("./fetchWrapper").getFetch;

async function transcribeAudio(audioBlob) {
  const fetch = await getFetch();
  const response = await fetch("https://api.openai.com/v1/whisper/asr", {
    method: "POST",
    body: audioBlob,
    headers: {
      "Content-Type": "audio/wav",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  const responseData = await response.json();
  const transcript = responseData.transcript || "Error transcribing audio.";
  return transcript;
}

async function getAnswer(prompt) {
  const response = await axios.post(
    "https://api.openai.com/v1/engines/davinci-codex/completions",
    {
      prompt: `Answer the following question: ${prompt}`,
      max_tokens: 4096,
      n: 1,
      stop: null,
      temperature: 0.5,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  return response.data.choices[0].text.trim();
}

app.post("/process-audio", upload.single("audio"), async (req, res) => {
  try {
    const audioBlob = req.file.buffer;
    const transcript = await transcribeAudio(audioBlob);
    const answer = await getAnswer(transcript);
    res.json({ transcript, answer });
  } catch (error) {
    console.error("Error processing audio:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
