import { Nonce } from "@iov/bcp-types";
import { Int53 } from "@iov/encoding";

import BN = require("bn.js");

export function decodeHexQuantity(hexString: string): number {
  if (hexString === "0x0" || hexString.match(/^0x{1}[a-f1-9][a-f0-9]*$/)) {
    return parseInt(hexString, 16);
  }
  throw new Error("invalid hex quantity input");
}

export function decodeHexQuantityString(hexString: string): string {
  if (hexString.match(/^0x[a-f0-9]+$/)) {
    const hexToBN = new BN(hexString.replace("0x", ""), 16);
    return hexToBN.toString();
  }
  throw new Error("invalid hex quantity input");
}

export function decodeHexQuantityNonce(hexString: string): Nonce {
  const nonce = decodeHexQuantity(hexString);
  return new Int53(nonce) as Nonce;
}
