export class WavRecorder {
  recording = false;
  constructor(_opts: { sampleRate: number }) {}
  async begin() {}
  async record(_cb: (data: { mono: Int16Array }) => void) {
    this.recording = true;
  }
  async pause() {
    this.recording = false;
  }
  async end() {
    this.recording = false;
  }
  getFrequencies(_type: string) {
    return { values: new Float32Array([0]) };
  }
  static async decode(
    _data: any,
    _inputRate: number,
    _outputRate: number
  ): Promise<{ url: string }> {
    return { url: "" };
  }
}

export class WavStreamPlayer {
  analyser: boolean = false;
  constructor(_opts: { sampleRate: number }) {}
  async connect() {}
  add16BitPCM(_data: any, _id: string) {}
  async interrupt(): Promise<{ trackId: string; offset: number } | null> {
    return null;
  }
  getFrequencies(_type: string) {
    return { values: new Float32Array([0]) };
  }
}
