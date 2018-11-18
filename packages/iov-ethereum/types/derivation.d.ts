import { PublicKeyBytes } from "@iov/base-types";
import { Address } from "@iov/bcp-types";
export declare function isValidAddress(address: string): boolean;
export declare function pubkeyToAddress(pubkey: PublicKeyBytes, sanitize: boolean): Address;
