import { Nonce } from "@iov/bcp-types";
import { Int53 } from "@iov/encoding";

import { decodeHexQuantity, decodeHexQuantityNonce, decodeHexQuantityString } from "./utils";

describe("Ethereum utils", () => {
  describe("decodeHexQuantity", () => {
    it("verify valid inputs", () => {
      let decStrQty;
      decStrQty = decodeHexQuantity("0x09184e72a000");
      expect(decStrQty).toEqual(10000000000000);
      decStrQty = decodeHexQuantity("0x400");
      expect(decStrQty).toEqual(1024);
      decStrQty = decodeHexQuantity("0x41");
      expect(decStrQty).toEqual(65);
      decStrQty = decodeHexQuantity("0x2");
      expect(decStrQty).toEqual(2);
      decStrQty = decodeHexQuantity("0x0");
      expect(decStrQty).toEqual(0);
    });

    it("throws error for invalid inputs", () => {
      expect(() => decodeHexQuantity("0x")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantity("ff")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantity("0xa0xa0xa0xa0xa")).toThrowError(/invalid hex quantity input/);
    });
  });

  describe("decodeHexQuantityString", () => {
    it("verify valid inputs", () => {
      let decStrQty;
      decStrQty = decodeHexQuantityString("0xd3c21bcecceda0ffffff");
      expect(decStrQty).toEqual("999999999999999999999999");
      decStrQty = decodeHexQuantityString("0xde0b6b3a763ffff");
      expect(decStrQty).toEqual("999999999999999999");
      decStrQty = decodeHexQuantityString("0x38d7ea4c67fff");
      expect(decStrQty).toEqual("999999999999999");
      decStrQty = decodeHexQuantityString("0x09184e72a000");
      expect(decStrQty).toEqual("10000000000000");
      decStrQty = decodeHexQuantityString("0x400");
      expect(decStrQty).toEqual("1024");
      decStrQty = decodeHexQuantityString("0x41");
      expect(decStrQty).toEqual("65");
      decStrQty = decodeHexQuantityString("0x2");
      expect(decStrQty).toEqual("2");
      decStrQty = decodeHexQuantityString("0x0");
      expect(decStrQty).toEqual("0");
    });

    it("throws error for invalid inputs", () => {
      expect(() => decodeHexQuantity("0x")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantity("ff")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantity("0xa0xa0xa0xa0xa")).toThrowError(/invalid hex quantity input/);
    });
  });

  describe("decodeHexQuantityNonce", () => {
    it("verify valid inputs", () => {
      let decStrQty;
      decStrQty = decodeHexQuantityNonce("0x38d7ea4c67fff");
      expect(decStrQty).toEqual(new Int53(999999999999999) as Nonce);
      decStrQty = decodeHexQuantityNonce("0x09184e72a000");
      expect(decStrQty).toEqual(new Int53(10000000000000) as Nonce);
      decStrQty = decodeHexQuantityNonce("0x400");
      expect(decStrQty).toEqual(new Int53(1024) as Nonce);
      decStrQty = decodeHexQuantityNonce("0x41");
      expect(decStrQty).toEqual(new Int53(65) as Nonce);
      decStrQty = decodeHexQuantityNonce("0x2");
      expect(decStrQty).toEqual(new Int53(2) as Nonce);
      decStrQty = decodeHexQuantityNonce("0x0");
      expect(decStrQty).toEqual(new Int53(0) as Nonce);
    });

    it("throws error for invalid inputs", () => {
      expect(() => decodeHexQuantity("0x")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantity("ff")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantity("0xa0xa0xa0xa0xa")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantityNonce("0xd3c21bcecceda0ffffff")).toThrowError(/Input not in int53 range/);
      expect(() => decodeHexQuantityNonce("0xde0b6b3a763ffff")).toThrowError(/Input not in int53 range/);
    });
  });
});
