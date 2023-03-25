class SilenceDetection {
  constructor(
    audioContext,
    silenceCallback,
    silenceDuration = 5000,
    minDecibels = -70
  ) {
    this.audioContext = audioContext;
    this.silenceCallback = silenceCallback;
    this.silenceDuration = silenceDuration;
    this.minDecibels = minDecibels;
    this.start = null;
  }

  process(audioBuffer) {
    if (this._isSilent(audioBuffer)) {
      if (this.start === null) {
        this.start = this.audioContext.currentTime;
      } else if (
        this.audioContext.currentTime - this.start >=
        this.silenceDuration / 1000
      ) {
        this.silenceCallback();
        this.start = null;
      }
    } else {
      this.start = null;
    }
  }

  _isSilent(audioBuffer) {
    const data = audioBuffer.getChannelData(0);
    const isSilent = data.every(
      (sample) => Math.abs(sample) < Math.pow(10, this.minDecibels / 20)
    );
    return isSilent;
  }
}

export default SilenceDetection;
