/**
 * Utilitaires de chiffrement pour les sauvegardes
 * Utilise l'API Web Crypto pour le chiffrement AES-GCM
 */

// Constantes
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits pour AES-GCM
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

/**
 * Génère une clé de chiffrement à partir d'un mot de passe
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import du mot de passe comme clé brute
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Dérivation de la clé avec PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Génère un IV aléatoire
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Génère un sel aléatoire
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Convertit un ArrayBuffer en chaîne Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convertit une chaîne Base64 en ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export interface EncryptedData {
  version: number;
  salt: string;
  iv: string;
  data: string;
  checksum: string;
}

/**
 * Calcule un checksum simple pour vérifier l'intégrité
 */
function calculateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Chiffre les données avec un mot de passe
 */
export async function encryptData(data: string, password: string): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(password, salt);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    dataBuffer
  );

  const encryptedBase64 = arrayBufferToBase64(encryptedBuffer);

  return {
    version: 1,
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv),
    data: encryptedBase64,
    checksum: calculateChecksum(data),
  };
}

/**
 * Déchiffre les données avec un mot de passe
 */
export async function decryptData(encrypted: EncryptedData, password: string): Promise<string> {
  if (encrypted.version !== 1) {
    throw new Error('Version de chiffrement non supportée');
  }

  const salt = new Uint8Array(base64ToArrayBuffer(encrypted.salt));
  const iv = new Uint8Array(base64ToArrayBuffer(encrypted.iv));
  const encryptedData = base64ToArrayBuffer(encrypted.data);

  const key = await deriveKey(password, salt);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    const decryptedData = decoder.decode(decryptedBuffer);

    // Vérifier le checksum
    const checksum = calculateChecksum(decryptedData);
    if (checksum !== encrypted.checksum) {
      throw new Error('Checksum invalide - données corrompues');
    }

    return decryptedData;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Checksum')) {
      throw error;
    }
    throw new Error('Mot de passe incorrect ou données corrompues');
  }
}

/**
 * Vérifie si les données sont chiffrées
 */
export function isEncryptedData(data: unknown): data is EncryptedData {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.version === 'number' &&
    typeof obj.salt === 'string' &&
    typeof obj.iv === 'string' &&
    typeof obj.data === 'string' &&
    typeof obj.checksum === 'string'
  );
}

/**
 * Vérifie si l'API Web Crypto est disponible
 */
export function isCryptoSupported(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  );
}

/**
 * Génère un mot de passe aléatoire sécurisé
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  return password;
}
