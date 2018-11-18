import { PublicKeyBytes } from "@iov/base-types";
import { Address } from "@iov/bcp-types";
import { Keccak256 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import secp256k1 from "secp256k1";

const { toAscii, toHex } = Encoding;

export function isValidAddress(address: string): boolean {
  if (address.match(/^0x[a-fA-F0-9]+$/) && address.length === 42) {
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md
    const addressLower = address.toLowerCase().replace("0x", "") as Address;
    const addressHash = toHex(new Keccak256(toAscii(addressLower)).digest());
    for (let i = 0; i < 40; i++) {
      if (
        (parseInt(addressHash[i], 16) > 7 && addressLower[i].toUpperCase() !== address[i + 2]) ||
        (parseInt(addressHash[i], 16) <= 7 && addressLower[i] !== address[i + 2])
      ) {
        return false;
      }
    }
    return true;
  }
  throw new Error("Invalid ethereum address");
}

export function pubkeyToAddress(pubkey: PublicKeyBytes, sanitize: boolean): Address {
  let pubKeyBuffer = Buffer.from(pubkey);
  if (sanitize && pubKeyBuffer.length !== 64) {
    pubKeyBuffer = secp256k1.publicKeyConvert(pubKeyBuffer, false).slice(1);
  }
  if (pubKeyBuffer.length !== 64) {
    throw new Error("Invalid pubkey length");
  }
  return ("0x" + Encoding.toHex(new Keccak256(pubKeyBuffer).digest().slice(-20))) as Address;
}
