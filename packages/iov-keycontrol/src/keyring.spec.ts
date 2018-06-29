import { Encoding } from "@iov/crypto";

import { Keyring } from "./keyring";
import { Ed25519HdKeyringEntry } from "./keyring-entries/ed25519hd";

const { fromHex } = Encoding;

describe("Keyring", () => {
  it("can be constructed", () => {
    const keyring = new Keyring();
    expect(keyring).toBeTruthy();
  });

  it("is empty after construction", () => {
    const keyring = new Keyring();
    expect(keyring.getEntries().length).toEqual(0);
  });

  it("can add one entry", () => {
    const keyring = new Keyring();
    const entry = Ed25519HdKeyringEntry.fromEntropy(fromHex("065a823769888cbc84e8455522f0e1a066447cb1120aa92e6ee251b74257a7bf"));

    keyring.add(entry);

    expect(keyring.getEntries().length).toEqual(1);
    // Ensure added entry is the same object, no copy of it
    expect(keyring.getEntries()[0]).toBe(entry);
  });

  it("can add multiple entries", () => {
    const keyring = new Keyring();
    const entry1 = Ed25519HdKeyringEntry.fromEntropy(fromHex("f7e7f1bbb327113a46fd3fa1020413de"));
    const entry2 = Ed25519HdKeyringEntry.fromEntropy(fromHex("5757dc651a1bfbcc37c80b0393a00590becb80cfe193ca0e"));
    // Entry 3 and 4 have the same seed. This is stupid but not the Keyring's problem
    const entry3 = Ed25519HdKeyringEntry.fromEntropy(fromHex("3275a0acb9f697875d829119e4eda0f799afe5e8fb0bc7199c75ae19df610949"));
    const entry4 = Ed25519HdKeyringEntry.fromEntropy(fromHex("3275a0acb9f697875d829119e4eda0f799afe5e8fb0bc7199c75ae19df610949"));

    keyring.add(entry1);
    keyring.add(entry2);
    keyring.add(entry3);
    keyring.add(entry4);

    expect(keyring.getEntries().length).toEqual(4);
    expect(keyring.getEntries()[0]).toBe(entry1);
    expect(keyring.getEntries()[1]).toBe(entry2);
    expect(keyring.getEntries()[2]).toBe(entry3);
    expect(keyring.getEntries()[3]).toBe(entry4);
  });

  it("can serialize empty", () => {
    const keyring = new Keyring();
    expect(keyring.serialize()).toEqual('{"entries":[]}');
  });

  it("can serialize one entry", () => {
    const keyring = new Keyring();
    const entry = Ed25519HdKeyringEntry.fromEntropy(fromHex("c7f74844892fd7b707e74fc9b6c8ef917c13ddbb380cadbc"));
    keyring.add(entry);

    expect(keyring.serialize()).toMatch(/^{\"entries\":\[\"{.*}\"\]}$/);
  });

  it("can serialize many entries", () => {
    const keyring = new Keyring();
    const entry1 = Ed25519HdKeyringEntry.fromEntropy(fromHex("c7f74844892fd7b707e74fc9b6c8ef917c13ddbb380cadbc"));
    const entry2 = Ed25519HdKeyringEntry.fromEntropy(fromHex("2a7e3f902279af82138f14f871badf8d92b33713eb6c7193"));
    const entry3 = Ed25519HdKeyringEntry.fromEntropy(fromHex("602c79484cf098bd4445ad45b5e6557d83ec743cebddb4cd"));
    const entry4 = Ed25519HdKeyringEntry.fromEntropy(fromHex("1124ef7ab681387eba8fdd93a0a88ec2f3326f2a6e5e967d"));
    const entry5 = Ed25519HdKeyringEntry.fromEntropy(fromHex("cd0e346ae5c714a1514562cb8ad5d4b5a2443dbbc5dd2b5b"));
    const entry6 = Ed25519HdKeyringEntry.fromEntropy(fromHex("e38dd5c066406668b51be00e8ad0276ed9dec967d95c2248"));
    keyring.add(entry1);
    keyring.add(entry2);
    keyring.add(entry3);
    keyring.add(entry4);
    keyring.add(entry5);
    keyring.add(entry6);

    expect(keyring.serialize()).toMatch(/^{\"entries\":\[\"{.*}\"(,\"{.*}\")+\]}$/);
  });
});
