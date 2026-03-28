function randomChunk(length: number): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  if (typeof crypto === "undefined" || typeof crypto.getRandomValues !== "function") {
    throw new Error("Secure random generator unavailable");
  }
  const maxUnbiasedByte = alphabet.length * Math.floor(256 / alphabet.length);
  let out = "";
  while (out.length < length) {
    const bytes = new Uint8Array(length - out.length);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte >= maxUnbiasedByte) continue;
      out += alphabet[byte % alphabet.length];
      if (out.length === length) break;
    }
  }
  return out;
}

export function createPrefixedId(prefix: string): string {
  return `${prefix}_${randomChunk(24)}`;
}
