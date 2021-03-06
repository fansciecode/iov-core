import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes, SignatureBytes } from "@iov/base-types";
import {
  Address,
  BcpAccountQuery,
  SendTx,
  SignedTransaction,
  TokenTicker,
  TransactionKind,
} from "@iov/bcp-types";
import { Derivation } from "@iov/dpos";
import { Encoding } from "@iov/encoding";
import { Ed25519Wallet } from "@iov/keycontrol";

import { liskCodec } from "./liskcodec";
import { generateNonce, LiskConnection } from "./liskconnection";

const { fromHex } = Encoding;

function pendingWithoutLiskDevnet(): void {
  if (!process.env.LISK_ENABLED) {
    pending("Set LISK_ENABLED to enable Lisk network tests");
  }
}

describe("LiskConnection", () => {
  // a network that does not exist used for non-networking tests
  const dummynetBase = "https://my-host.tld:12345";
  const dummynetChainId = "f0b96e79655665abbe95b7a7f626036eb20244ead279e5f972e87cbfd77daa09" as ChainId;
  // a local devnet
  const devnetBase = "http://localhost:4000";
  const devnetChainId = "198f2b61a8eb95fbeed58b8216780b68f697f26b849acf00c8c93bb9b24f783d" as ChainId;

  it("can be constructed", () => {
    const connection = new LiskConnection(dummynetBase, dummynetChainId);
    expect(connection).toBeTruthy();
  });

  it("takes different kind of API URLs", () => {
    expect(new LiskConnection("http://localhost", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://localhost/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://localhost", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://localhost/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://localhost:456", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://localhost:456/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://localhost:456", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://localhost:456/", dummynetChainId)).toBeTruthy();

    expect(new LiskConnection("http://my-HOST.tld", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://my-HOST.tld/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://my-HOST.tld", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://my-HOST.tld/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://my-HOST.tld:456", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://my-HOST.tld:456/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://my-HOST.tld:456", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://my-HOST.tld:456/", dummynetChainId)).toBeTruthy();

    expect(new LiskConnection("http://123.123.123.123", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://123.123.123.123/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://123.123.123.123", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://123.123.123.123/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://123.123.123.123:456", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://123.123.123.123:456/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://123.123.123.123:456", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://123.123.123.123:456/", dummynetChainId)).toBeTruthy();
  });

  it("throws for invalid API URLs", () => {
    // wrong scheme
    expect(() => new LiskConnection("localhost", dummynetChainId)).toThrowError(/invalid api url/i);
    expect(() => new LiskConnection("ftp://localhost", dummynetChainId)).toThrowError(/invalid api url/i);
    expect(() => new LiskConnection("ws://localhost", dummynetChainId)).toThrowError(/invalid api url/i);

    // unsupported hosts
    expect(() => new LiskConnection("http://[2001::0370:7344]/", dummynetChainId)).toThrowError(
      /invalid api url/i,
    );
    expect(() => new LiskConnection("http://[2001::0370:7344]:8080/", dummynetChainId)).toThrowError(
      /invalid api url/i,
    );

    // wrong path
    expect(() => new LiskConnection("http://localhost/api", dummynetChainId)).toThrowError(
      /invalid api url/i,
    );
  });

  it("can disconnect", () => {
    const connection = new LiskConnection(dummynetBase, dummynetChainId);
    expect(() => connection.disconnect()).not.toThrow();
  });

  it("can get existing ticker", async () => {
    const connection = new LiskConnection(dummynetBase, dummynetChainId);
    const response = await connection.getTicker("LSK" as TokenTicker);
    expect(response.data.length).toEqual(1);
    expect(response.data[0].tokenTicker).toEqual("LSK");
    expect(response.data[0].tokenName).toEqual("Lisk");
    expect(response.data[0].sigFigs).toEqual(8);
  });

  it("produces empty result for non-existing ticker", async () => {
    const connection = new LiskConnection(dummynetBase, dummynetChainId);
    const response = await connection.getTicker("ETH" as TokenTicker);
    expect(response.data.length).toEqual(0);
  });

  it("can get all tickers", async () => {
    const connection = new LiskConnection(dummynetBase, dummynetChainId);
    const response = await connection.getAllTickers();
    expect(response.data.length).toEqual(1);
    expect(response.data[0].tokenTicker).toEqual("LSK");
    expect(response.data[0].tokenName).toEqual("Lisk");
    expect(response.data[0].sigFigs).toEqual(8);
  });

  it("can get chain ID", async () => {
    pendingWithoutLiskDevnet();
    const connection = await LiskConnection.establish(devnetBase);
    const chainId = connection.chainId();
    expect(chainId).toEqual(devnetChainId);
  });

  it("can get height", async () => {
    pendingWithoutLiskDevnet();
    const connection = await LiskConnection.establish(devnetBase);
    const height = await connection.height();
    expect(height).toBeGreaterThan(0);
    expect(height).toBeLessThan(10000000);
  });

  it("can get account from address", async () => {
    pendingWithoutLiskDevnet();
    const connection = await LiskConnection.establish(devnetBase);
    const query: BcpAccountQuery = { address: "1349293588603668134L" as Address };
    const account = await connection.getAccount(query);
    expect(account.data[0].address).toEqual("1349293588603668134L");
    expect(account.data[0].balance[0].tokenTicker).toEqual("LSK");
    expect(account.data[0].balance[0].sigFigs).toEqual(8);
    expect(account.data[0].balance[0].whole).toEqual(100);
    expect(account.data[0].balance[0].fractional).toEqual(34556677);
  });

  it("can get account from pubkey", async () => {
    pendingWithoutLiskDevnet();
    const connection = await LiskConnection.establish(devnetBase);
    const pubkey: PublicKeyBundle = {
      algo: Algorithm.Ed25519,
      data: fromHex("e9e00a111875ccd0c2c937d87da18532cf99d011e0e8bfb981638f57427ba2c6") as PublicKeyBytes,
    };
    const query: BcpAccountQuery = { pubkey: pubkey };
    const account = await connection.getAccount(query);
    expect(account.data[0].address).toEqual("1349293588603668134L");
    expect(account.data[0].balance[0].tokenTicker).toEqual("LSK");
    expect(account.data[0].balance[0].sigFigs).toEqual(8);
    expect(account.data[0].balance[0].whole).toEqual(100);
    expect(account.data[0].balance[0].fractional).toEqual(34556677);
  });

  it("returns empty list when getting an unused account", async () => {
    pendingWithoutLiskDevnet();
    const unusedAddress = "5648777643193648871L" as Address;
    const connection = await LiskConnection.establish(devnetBase);
    const response = await connection.getAccount({ address: unusedAddress });
    expect(response).toBeTruthy();
    expect(response.data).toBeTruthy();
    expect(response.data.length).toEqual(0);
  });

  it("can get nonce", async () => {
    pendingWithoutLiskDevnet();
    const connection = await LiskConnection.establish(devnetBase);
    const query: BcpAccountQuery = { address: "6472030874529564639L" as Address };
    const nonce = await connection.getNonce(query);

    expect(nonce.data[0].address).toEqual("6472030874529564639L");
    // nonce is current timestamp +/- one second
    expect(nonce.data[0].nonce.toNumber()).toBeGreaterThanOrEqual(Date.now() / 1000 - 1);
    expect(nonce.data[0].nonce.toNumber()).toBeLessThanOrEqual(Date.now() / 1000 + 1);
  });

  it("can post transaction", async () => {
    pendingWithoutLiskDevnet();

    const wallet = new Ed25519Wallet();
    const mainIdentity = await wallet.createIdentity(
      await Derivation.passphraseToKeypair(
        "wagon stock borrow episode laundry kitten salute link globe zero feed marble",
      ),
    );

    const recipientAddress = "16313739661670634666L" as Address;

    const sendTx: SendTx = {
      kind: TransactionKind.Send,
      chainId: devnetChainId,
      signer: mainIdentity.pubkey,
      recipient: recipientAddress,
      memo: "We ❤️ developers – iov.one",
      amount: {
        whole: 1,
        fractional: 44550000,
        tokenTicker: "LSK" as TokenTicker,
      },
    };

    // Encode creation timestamp into nonce
    const nonce = generateNonce();
    const signingJob = liskCodec.bytesToSign(sendTx, nonce);
    const signature = await wallet.createTransactionSignature(
      mainIdentity,
      signingJob.bytes,
      signingJob.prehashType,
      devnetChainId,
    );

    const signedTransaction: SignedTransaction = {
      transaction: sendTx,
      primarySignature: {
        nonce: nonce,
        pubkey: mainIdentity.pubkey,
        signature: signature,
      },
      otherSignatures: [],
    };
    const bytesToPost = liskCodec.bytesToPost(signedTransaction);

    const connection = await LiskConnection.establish(devnetBase);
    const result = await connection.postTx(bytesToPost);
    expect(result).toBeTruthy();
  });

  it("throws for invalid transaction", async () => {
    pendingWithoutLiskDevnet();

    const wallet = new Ed25519Wallet();
    const mainIdentity = await wallet.createIdentity(
      await Derivation.passphraseToKeypair(
        "wagon stock borrow episode laundry kitten salute link globe zero feed marble",
      ),
    );

    const recipientAddress = "16313739661670634666L" as Address;

    const sendTx: SendTx = {
      kind: TransactionKind.Send,
      chainId: devnetChainId,
      signer: mainIdentity.pubkey,
      recipient: recipientAddress,
      memo: "We ❤️ developers – iov.one",
      amount: {
        whole: 1,
        fractional: 44550000,
        tokenTicker: "LSK" as TokenTicker,
      },
    };

    // Encode creation timestamp into nonce
    const nonce = generateNonce();
    const signingJob = liskCodec.bytesToSign(sendTx, nonce);
    const signature = await wallet.createTransactionSignature(
      mainIdentity,
      signingJob.bytes,
      signingJob.prehashType,
      devnetChainId,
    );

    // tslint:disable-next-line:no-bitwise
    const corruptedSignature = signature.map((x, i) => (i === 0 ? x ^ 0x01 : x)) as SignatureBytes;

    const signedTransaction: SignedTransaction = {
      transaction: sendTx,
      primarySignature: {
        nonce: nonce,
        pubkey: mainIdentity.pubkey,
        signature: corruptedSignature,
      },
      otherSignatures: [],
    };
    const bytesToPost = liskCodec.bytesToPost(signedTransaction);

    const connection = await LiskConnection.establish(devnetBase);
    await connection
      .postTx(bytesToPost)
      .then(() => fail("must not resolve"))
      .catch(error => expect(error).toMatch(/failed with status code 409/i));
  });
});
