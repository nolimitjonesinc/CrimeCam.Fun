declare module 'heic-decode' {
  export interface DecodeResult {
    width: number;
    height: number;
    data: Uint8ClampedArray;
  }

  export default function decode(options: { buffer: ArrayBuffer }): Promise<DecodeResult>;
}
