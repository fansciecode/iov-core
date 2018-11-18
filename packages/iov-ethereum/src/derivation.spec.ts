import { PublicKeyBytes } from "@iov/base-types";
import { Encoding } from "@iov/encoding";
import { isValidAddress, pubkeyToAddress } from "./derivation";

describe("derivation", () => {
  describe("isValidAddress", () => {
    it("should check valid addresses", () => {
      // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md#test-cases
      expect(isValidAddress("0x52908400098527886E0F7030069857D2E4169EE7")).toEqual(true);
      expect(isValidAddress("0x8617E340B3D01FA5F11F306F4090FD50E238070D")).toEqual(true);
      expect(isValidAddress("0xde709f2102306220921060314715629080e2fb77")).toEqual(true);
      expect(isValidAddress("0x27b1fdb04752bbc536007a920d24acb045561c26")).toEqual(true);
      expect(isValidAddress("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed")).toEqual(true);
      expect(isValidAddress("0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359")).toEqual(true);
      expect(isValidAddress("0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB")).toEqual(true);
      expect(isValidAddress("0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb")).toEqual(true);
    });

    it("rejects malformed addresses", () => {
      // changed some letters from previous test from upper to lowercase and vice versa
      expect(isValidAddress("0x52908400098527886E0F7030069857D2E4169ee7")).toEqual(false);
      expect(isValidAddress("0x8617E340B3D01FA5F11F306F4090FD50e238070d")).toEqual(false);
      expect(isValidAddress("0xde709f2102306220921060314715629080e2FB77")).toEqual(false);
      expect(isValidAddress("0x27b1fdb04752bbc536007a920d24acb045561C26")).toEqual(false);
      expect(isValidAddress("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAED")).toEqual(false);
      expect(isValidAddress("0xfB6916095ca1df60bB79Ce92cE3Ea74c37C5D359")).toEqual(false);
      expect(isValidAddress("0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6fb")).toEqual(false);
      expect(isValidAddress("0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9ADB")).toEqual(false);
      // to short
      expect(() => isValidAddress("0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9")).toThrowError(
        /Invalid ethereum address/,
      );
      // to long
      expect(() => isValidAddress("0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b91234")).toThrowError(
        /Invalid ethereum address/,
      );
      // not starting with 0x
      expect(() => isValidAddress("D1220A0cf47c7B9Be7A2E6BA89F429762e7b91234")).toThrowError(
        /Invalid ethereum address/,
      );
    });
  });

  describe("pubkeyToAddress", () => {
    it("should produce an address given a public key", () => {
      const publicKey =
        "3a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";
      const pubkey = Encoding.fromHex(publicKey) as PublicKeyBytes;
      expect(pubkeyToAddress(pubkey, false)).toEqual("0x2f015c60e0be116b1f0cd534704db9c92118fb6a");
    });
    it("should produce an address given a SEC1 public key", () => {
      const publicKey =
        "043a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";
      const pubkey = Encoding.fromHex(publicKey) as PublicKeyBytes;
      expect(pubkeyToAddress(pubkey, true)).toEqual("0x2f015c60e0be116b1f0cd534704db9c92118fb6a");
    });
    it("shouldn't produce an address given an invalid SEC1 public key", () => {
      const publicKey =
        "023a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";
      const pubkey = Encoding.fromHex(publicKey) as PublicKeyBytes;
      expect(() => pubkeyToAddress(pubkey, true)).toThrowError(
        /the public key could not be parsed or is invalid/,
      );
    });
    it("shouldn't produce an address given an invalid public key", () => {
      const publicKey =
        "3a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae744";
      const pubkey = Encoding.fromHex(publicKey) as PublicKeyBytes;
      expect(() => pubkeyToAddress(pubkey, false)).toThrowError(/Invalid pubkey length/);
    });
  });
});
