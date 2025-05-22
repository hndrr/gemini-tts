export interface WavConversionOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}

export function convertToWav(
  rawData: Uint8Array,
  mimeType: string
): Uint8Array {
  const options = parseMimeType(mimeType);
  const wavHeader = createWavHeader(rawData.length, options);

  const combined = new Uint8Array(wavHeader.length + rawData.length);
  combined.set(wavHeader, 0);
  combined.set(rawData, wavHeader.length);

  return combined;
}

export function parseMimeType(mimeType: string): WavConversionOptions {
  const [fileType, ...params] = mimeType.split(";").map((s) => s.trim());
  const [, format] = fileType.split("/");

  const options: Partial<WavConversionOptions> = {
    numChannels: 1,
    sampleRate: 44100,
    bitsPerSample: 16,
  };

  if (format && format.startsWith("L")) {
    const bits = parseInt(format.slice(1), 10);
    if (!isNaN(bits)) {
      options.bitsPerSample = bits;
    }
  }

  for (const param of params) {
    const [key, value] = param.split("=").map((s) => s.trim());
    if (key === "rate") {
      options.sampleRate = parseInt(value, 10);
    }
  }

  return options as WavConversionOptions;
}

export function createWavHeader(
  dataLength: number,
  options: WavConversionOptions
): Uint8Array {
  const { numChannels, sampleRate, bitsPerSample } = options;

  // http://soundfile.sapp.org/doc/WaveFormat
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const headerLength = 44;
  const buffer = new ArrayBuffer(headerLength);
  const view = new DataView(buffer);

  function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(view, 0, "RIFF"); // ChunkID
  view.setUint32(4, 36 + dataLength, true); // ChunkSize
  writeString(view, 8, "WAVE"); // Format
  writeString(view, 12, "fmt "); // Subchunk1ID
  view.setUint32(16, 16, true); // Subchunk1Size (PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample
  writeString(view, 36, "data"); // Subchunk2ID
  view.setUint32(40, dataLength, true); // Subchunk2Size

  return new Uint8Array(buffer);
}
