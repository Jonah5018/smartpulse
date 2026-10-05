import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function keyFrom(value: string) {
  const key = Buffer.from(value, "base64");
  if (key.length !== 32)
    throw new Error("A 32-byte credential encryption key is required.");
  return key;
}
/** Bind each encrypted token to its owner and connection to prevent ciphertext swapping. */
export function sealCredential(
  token: string,
  key: string,
  ownerAndConnection: string,
) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFrom(key), nonce);
  cipher.setAAD(Buffer.from(ownerAndConnection));
  const data = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return [
    "v1",
    nonce.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    data.toString("base64"),
  ].join(".");
}
export function openCredential(
  sealed: string,
  key: string,
  ownerAndConnection: string,
) {
  const [version, nonce, tag, data, ...extra] = sealed.split(".");
  if (version !== "v1" || !nonce || !tag || !data || extra.length)
    throw new Error("Invalid credential envelope.");
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      keyFrom(key),
      Buffer.from(nonce, "base64"),
    );
    decipher.setAAD(Buffer.from(ownerAndConnection));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(data, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new Error("Credential could not be decrypted.");
  }
}
