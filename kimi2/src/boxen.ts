# kimi2/src/boxen.ts
import nacl from "tweetnacl";
const KEY = "nacl.secretbox"; // derive from email in real life
export function encode(plain: string, email: string): string {
  const key = nacl.hash(new TextEncoder().encode(email)).slice(0, 32);
  const nonce = nacl.random(nacl.secretbox.nonceLength);
  const box = nacl.secretbox(new TextEncoder().encode(plain), nonce, key);
  return btoa(String.fromCharCode(...nonce, ...box));
}
export function decode(enc: string, email: string): string {
  const key = nacl.hash(new TextEncoder().encode(email)).slice(0, 32);
  const buf = Uint8Array.from(atob(enc), (c) => c.charCodeAt(0));
  const nonce = buf.slice(0, nacl.secretbox.nonceLength);
  const box = buf.slice(nacl.secretbox.nonceLength);
  const plain = nacl.open(box, nonce, key);
  if (!plain) throw new Error("decryption failed");
  return new TextDecoder().decode(plain);
}