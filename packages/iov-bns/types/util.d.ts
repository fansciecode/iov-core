import { AddressBytes, ChainId, Nonce, PublicKeyBundle, SignableBytes } from "@iov/types";
export declare const keyToAddress: (key: PublicKeyBundle) => AddressBytes;
export declare const keyToIdentifier: (key: PublicKeyBundle) => Uint8Array;
export declare const appendSignBytes: (bz: Uint8Array, chainId: ChainId, nonce: Nonce) => SignableBytes;
export declare const tendermintHash: (data: Uint8Array) => Uint8Array;
export declare const hashId: Uint8Array;
export declare const hashIdentifier: (data: Uint8Array) => Uint8Array;
export declare const arraysEqual: (a: Uint8Array, b: Uint8Array) => boolean;
export declare const isHashIdentifier: (ident: Uint8Array) => boolean;