export type CompressOptions = Partial<{
  /**
   * Which mode to use (1 through 9, defaults to 7)
   */
  mode: 1 | 2 | 3 | 4 | 5 | 6 | 7

  /**
   * Whether to write an end mark
   */
  enableEndMark: boolean
}>

/**
 * Compress a string with the LZMA algorithm
 *
 * @param value   The string to compress
 * @param options Compression options
 * @returns The compressed string (may contain binary data)
 */
export function compress(value: string, options?: CompressOptions): number[]

/**
 * Compress a string with the LZMA algorithm
 *
 * @param value   The string to compress
 * @param options Compression options
 * @returns The compressed string, Base64-encoded
 */
export function compressBase64(value: string, options?: CompressOptions): string

/**
 * Decompress a string compressed with the LZMA algorithm
 *
 * @param bytes The array created by the compress() function
 */
export function decompress(bytes: number[] | Int8Array): string

/**
 * Decompress a string compressed with the LZMA algorithm
 *
 * @param value The string created by the compressBase64() function
 */
export function decompressBase64(value: string): string
