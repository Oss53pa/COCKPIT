/**
 * Utilitaires de compression pour les données
 * Utilise l'API Compression Streams si disponible
 */

/**
 * Vérifie si l'API Compression Streams est disponible
 */
export function isCompressionSupported(): boolean {
  return (
    typeof CompressionStream !== 'undefined' &&
    typeof DecompressionStream !== 'undefined'
  );
}

/**
 * Compresse une chaîne avec gzip
 */
export async function compressString(input: string): Promise<Uint8Array> {
  if (!isCompressionSupported()) {
    // Fallback: retourner les données non compressées
    return new TextEncoder().encode(input);
  }

  const stream = new Blob([input]).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
  const chunks: Uint8Array[] = [];
  const reader = compressedStream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // Combiner les chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Décompresse des données gzip
 */
export async function decompressToString(compressed: Uint8Array): Promise<string> {
  if (!isCompressionSupported()) {
    // Fallback: retourner les données telles quelles
    return new TextDecoder().decode(compressed);
  }

  const stream = new Blob([compressed]).stream();
  const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
  const chunks: Uint8Array[] = [];
  const reader = decompressedStream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // Combiner et décoder
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(result);
}

/**
 * Convertit Uint8Array en Base64
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convertit Base64 en Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Compresse une chaîne et retourne en Base64
 */
export async function compressToBase64(input: string): Promise<string> {
  const compressed = await compressString(input);
  return uint8ArrayToBase64(compressed);
}

/**
 * Décompresse une chaîne Base64
 */
export async function decompressFromBase64(base64: string): Promise<string> {
  const compressed = base64ToUint8Array(base64);
  return decompressToString(compressed);
}

/**
 * Calcule le taux de compression
 */
export function calculateCompressionRatio(
  originalSize: number,
  compressedSize: number
): { ratio: number; savings: number; savingsPercent: number } {
  const ratio = originalSize / compressedSize;
  const savings = originalSize - compressedSize;
  const savingsPercent = (savings / originalSize) * 100;

  return {
    ratio: Math.round(ratio * 100) / 100,
    savings,
    savingsPercent: Math.round(savingsPercent * 10) / 10,
  };
}

/**
 * Compresse un objet JSON
 */
export async function compressJSON<T>(data: T): Promise<{
  compressed: string;
  originalSize: number;
  compressedSize: number;
  ratio: number;
}> {
  const json = JSON.stringify(data);
  const originalSize = new Blob([json]).size;

  const compressed = await compressToBase64(json);
  const compressedSize = compressed.length;

  return {
    compressed,
    originalSize,
    compressedSize,
    ratio: calculateCompressionRatio(originalSize, compressedSize).ratio,
  };
}

/**
 * Décompresse un objet JSON
 */
export async function decompressJSON<T>(compressed: string): Promise<T> {
  const json = await decompressFromBase64(compressed);
  return JSON.parse(json);
}

/**
 * Compresse pour stockage localStorage avec fallback
 */
export async function compressForStorage(data: unknown): Promise<string> {
  const json = JSON.stringify(data);

  // Si petit, pas besoin de compresser
  if (json.length < 1000) {
    return json;
  }

  try {
    const compressed = await compressToBase64(json);

    // Vérifier si la compression est bénéfique
    if (compressed.length < json.length * 0.9) {
      return `__compressed__:${compressed}`;
    }
  } catch {
    // Fallback
  }

  return json;
}

/**
 * Décompresse depuis localStorage
 */
export async function decompressFromStorage<T>(stored: string): Promise<T> {
  if (stored.startsWith('__compressed__:')) {
    const compressed = stored.slice('__compressed__:'.length);
    const json = await decompressFromBase64(compressed);
    return JSON.parse(json);
  }

  return JSON.parse(stored);
}
