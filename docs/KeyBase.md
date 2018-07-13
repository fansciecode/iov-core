# Keybase Architecture

This document details the construction of an BCP compatible keybase system. It
describes the core concepts of UserProfiles, Keyrings, and the identity types
they contain.

## Key Terms:

- `UserProfile`: A collection of User materials. Includes multiple `keyringEntries` associated with a `UserProfile`.
- `Keyring`: An object containing `keyringEntry`'s.
- `KeyringEntry`: An object which houses ONE `SeedIdentity` and N `PublicIdentities`.
- `SeedIdentity`: Single Private material entry in a `KeyringEntry`, used for deriving a `secret` to sign  transactions and generate `PublicIdentities`.
- `PublicIdentities`: Public materials collection. Contains the an array of objects related to a `SeedIdentity`.
- `PublicIdentity`: A collection of information derived from a `secret`. It includes an address, publicKey, and HD path data which is always defined via the HD specifications. Used for end user queries for balances and transaction histories.

## Feature Set:

The Keybase includes a fully featured suite of key management. This includes the
creation of new seeds, publickeys, and addresses. It also includes the usage of
a Hardware Wallet, and various cryptographic algorithms.

### Generation of HD Seeds

The Web4 Keybase will require the ability to generate new seeds from entropy for
a user, when needed. This can occur when a UserProfile is made, or later on
demand by the User.

### Import/Export of HD Seeds

Users will also need the ability to Import seeds from other software, and Export
Seeds from Web4 for reuse in other software.

### Creation of Public Keys, and Addresses

The Seeds generated by the Keybase will be used to create new public keys, and
addresses for use with blockchain technology. This will be done using standard
HD derivation techniques.

### Support for secp256k1 and ed25519

These are the two "industry standard" cryptographic algorithms. Both need to be
supported to enable the greatest compatibility. Others can be supported later,
such as `bls signatures` or `zk-snarks`.

### Hardware wallets, Ledger (Others TBA)

Hardware wallet support is necessary as more users are using these devices and
they provide extremely high security for the key material while remaining
practical to use. Ledger will be the first device type supported by the Keybase.

### Transaction/Message operations

The Keybase will have the following features:
- Sign and Verify Transactions
- Sign and Verify Messages

### Profile and HD Seed encryption

All data entered into a profile is encrypted before it is stored on disk.
Additionally, individual KeyringEntries can be encrypted by a separate passphrase.

## Standards Used:

The Keybase will implement a variety of standards regarding address derivation
and timestamp generation. These have been listed here for review.

### Hierarchical Deterministic Wallets
HD wallets will be created through this standard to yield a master publickey:privatekey pair.

- BIP32: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki

### Multi-Account Hierarchy for Deterministic Wallets
HD Wallets for chain specific support will be created through the following standards for each algorithm.

#### secp256k1
- BIP43: https://github.com/bitcoin/bips/blob/master/bip-0043.mediawiki
- BIP44: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki

#### ed25519
- SLIP0010: https://github.com/satoshilabs/slips/blob/master/slip-0010.md

#### Both
- SLIP0044: https://github.com/satoshilabs/slips/blob/master/slip-0044.md

### HD Seed Generation:
Seed generation will be performed through the BIP39 specification for HD seeds

- BIP39: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki

### Timestamp Generation
Timestamps are generated using a widely known standard to enable deterministic parsing.

- RFC 3339: https://tools.ietf.org/html/rfc3339

# Code Architecture
The code for keyring management is broken down into logical units, each performing a specific task. The design can be visualized as follows:

```
UserProfileController (1 UserProfileController)
  |
  | > UserProfile (1 UserProfile : N Users)
      |
      | > AddressBook (1 AddressBook : 1 UserProfile)
      |   | > AddressBookEntries (1 AddressBook : N AddressBookEntries)
      |
      | > SecurityModel (1 SecurityModel : 1 UserProfile)
      |
      | > Keyring (1 Keyring : 1 UserProfile)
          |
          | > keyringEntries (1 Keyring : N KeyringEntries)
              |
              | > SeedIdentity (1 KeyringEntry : 1 SeedIdentity)
                  |
                  | > PublicIdentities (1 SecretIdentity : N PublicIdentities)
```


## UserProfileController

The primary purpose of the `UserProfileController` is to manage multiple `UserProfile`s. It provides the logic to manipulate  `UserProfile`s.

The following functions are called by the `User`, through the `UserProfileController`

### Functions:

- CreateUserProfile: Creates a new user in the `UserProfileController`
- LoginUserProfile: Passes `username:password` pair to the `UserProfileController`
- DeleteUserProfile: Requests deletion of a `UserProfile` to the `UserProfileController`
- ExportUserProfile: Requests the plaintext export of `UserProfile` details, requires a correct `login`

### Object Definition:

```
{
  "UserProfiles": []
}
```

## UserProfile

 A `UserProfile` contains an object called `keyring`, an object called
`addressBook`, and an object called `securityModel`. This is a `1:N` relation,
where `N` is each `UserProfile` created by the `UserProfileController`.

### Object Definition:
```
"UserProfile": {
  "username": "isabella",
  "label": "My Profile",
  "created": "1985-04-12T23:20:50.52Z", # RFC 3339
  "securityModel": {
    "timeout": 3600
  },
  "keyring": {
    "keyringEntries": [],
  },
  "addressBook": {
    "addressBookEntries": []
  }
}
```

## AddressBook

Contains a list of addresses a user has interacted with, or added for frequent use.

### Functions:
- AddContact: Adds a contact to a `AddressBook` with the specified information.
- DeleteContact: Deletes a contact from a `AddressBook`
- GetContact: Returns the `chain:address:humanName` for use in the application.
- ExportContact: Returns a `contact` in plain text for import in another Web4 system.
- ImportContact: Adds a `contact` from a predefined plain text entry.

### Object Definition:
```
"addressBook": {
  "addressBookEntries": [
    {
      "address": "0x52b96095d265a93308fcf5cb9627085f029546be8b3",
      "chain": {
        "chain": "ETH",
        "tickers": ["ETH","ANT"]
      },
      "created": "1985-04-12T23:20:50.52Z", # RFC 3339
      "label": "Friend's Account"
    }
  ]
}
```

## SecurityModel

The `UserProfile` contains an object called `securityModel`. This object defines
the security parameters of the profile. The entries in this object establish
when a profile will lock down through inactivity. This is a `1:1` relation
inside of a `UserProfile`.

### Functions:
- GetSecurityDetails: Returns a security information for the `UserProfile`.
- ModifySecurityDetails: Changes security information for the `UserProfile`.

### Object Definition:
```
"securityModel": {
  "timeout": 3600
},
```

## Keyring

The `Keyring` is an object that houses `keyringEntries`. This object holds all
of the `UserProfile`'s `KeyringEntry`s. This is a `1:1` relation inside of a
`UserProfile`.

### Functions:
- GetKeyringEntry: Returns a requested `KeyringEntry`'s details, such as `PublicIdentities`.
- AddKeyringEntry: Adds a new `KeyringEntry`, with an autogenerated or imported `SecretIdentity` to the `Keyring`.
- DeleteKeyringEntry: Removes an existing `KeyringEntry` from the `Keyring`.
- ExportKeyringEntry: Exports a `KeyringEntry` in plain text, for use in another `Keyring`.
- ImportKeyringEntry: Imports a whole `KeyringEntry`, complete with a `SecretIdentity` and the list `PublicIdentities`.

### Object Definition:
```
"keyring": {
  "keyringEntries": []
},
```

## KeyringEntry

A `KeyringEntry` contains all of the related `SeedIdentity`,
`PublicIdentities` and personality information for an associated `SeedIdentity`.

A `SeedIdentity` is only an HD Seed value (`Mnemonic Passphrase`) or a
hardware device identifier for a `Ledger`.

This is a `1:1` relation, where each `KeyringEntry` has one `SeedIdentity`.

### Functions:
- CreateSeedIdentity: Creates a `SeedIdentity`, if the `KeyRingEntry` has none.
- RenameSeedIdentity: Changes the label of the `keyringEntry`.
- DeleteSeedIdentity: Removes the `SeedIdentity` from the `keyringEntry`.
- ExportSeedIdentity: Exports the `SeedIdentity` in plain text. Only the type of `HD` can be exported.

### Object Definition:
```
"KeyringEntry": {
  "label": "My Account",
  "SeedIdentity": {
   "seed": "shift nature mean excess demise mule winter between swing success bitter patch",
   "type": "HD" || "hardware"
  },
  "PublicIdentities": [
    "PublicIdentity": {}
  ]
}
```

## PublicIdentities

A `PublicIdentities` are derived from `seed:curve` pairs, which are used to
create a `PublicIdentity`.

This is a `1:N` relation, where 1 is the `SeedIdentity` for which the
`PublicIdentity` is related and N are the generated `PublicIdentities`.

### Functions:
- GetPublicIdentity: Returns `PublicIdentity` details for a specific algorithm.
- CreatePublicIdentity: Creates a `PublicIdentity` from the `SeedIdentity`.
- DeletePublicIdentity: Removes a `PublicIdentity` from `PublicIdentities`.
- ExportPublicIdentity: Exports  a `PublicIdentity` in plain text.

### Object Definition:
```
"PublicIdentities": [
  "PublicIdentity": {
    "address": "0x6806ea1d9b2eb59DAc7fdcdf28bf8d5a12AD84Bc",
    "label": "Wells Fargo",
    "publicKey": {
      "algo": ed25519,
      "data": "52b96095d265a93308fcf5cb9627085f029546be8b31eccb00bad386a92544d7"
    },
    "chain": {
      "chain": "ETH",
      "tickers": ["ETH","ANT"]
    },
    "path": {
      "root": "m",
      "purpose": "44'",
      "coinType": "60'", # Defined here: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
      "account": "0'",
      "change": "0'",
      "addressIndex": "0"
    },
  }
]
```

## Complete Object Definition

The following is what a fully initialized profile will look like. This includes one relation of each type.
```
"UserProfile": {
  "username": "isabella",
  "label": "My Profile",
  "created": "1985-04-12T23:20:50.52Z", # RFC 3339
  "securityModel": {
    "timeout": 3600
  },
  "keyring": {
    "keyringEntries": [
      "KeyringEntry": {
        "SeedIdentity": {
         "label": "My Account",
         "seed": "shift nature mean excess demise mule winter between swing success bitter patch",
         "type": "HD" || "hardware"
        },
        "PublicIdentities": [
          "PublicIdentity": {
            "address": "0x6806ea1d9b2eb59DAc7fdcdf28bf8d5a12AD84Bc",
            "label": "Wells Fargo",
            "publicKey": {
              "algo": ed25519,
              "data": "52b96095d265a93308fcf5cb9627085f029546be8b31eccb00bad386a92544d7"
            },
            "chain": {
              "chain": "ETH",
              "tickers": ["ETH","ANT"]
            },
            "path": {
              "root": "m",
              "purpose": "44'",
              "coinType": "60'", # Defined here: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
              "account": "0'",
              "change": "0'",
              "addressIndex": "0"
            }
          }
        ]
      }
    ],
  },
  "addressBook": {
    "addressBookEntries": [
      {
        "address": "0x52b96095d265a93308fcf5cb9627085f029546be8b3",
        "chain": "ETH",
        "tickers": ["ETH","ANT"],
        "created": "1985-04-12T23:20:50.52Z", # RFC 3339
        "label": "Friend's Account"
      }
    ]
  }
}
```

# Address Architecture

There are two main types of addresses implemented into the Keybase.
These are `Simple Addresses` and `Extended Addresses`.
The simple address will implement the base set of features offered by BIP43.
The extended addresses will implement the full suite of BIP44 features.

## Simple Addresses:

The BCP and BNS will both support the standard cryptography algorithms found in the majority of blockchain ecosystems. This includes `ed25519` and `secp256k1`. While these algorithms are different, we can use some key features of Bitcoin that have propogated and become standard throughout many implementations.

Simple addresses are BIP43 compatible HD addresses using the IOV purpose.

### IOV purpose (purpose = 4804438)

BIP43 describes the standard HD path specification. It allows the use of custom `purpose`s for
for custom address schemes. Simple addresses use `purpose = 4804438`.
The choosen purpose value is the integer created by the ascii encoding of the letters "IOV".
We hope it remains unique within the industry.

### Simple Address Derivation

Using `purpose = 4804438`, we create BIP43 compatible HD addresses using the derivation path
`m / 4804438' / i'` where `i` is an index starting at 0.

This creates a simple, linear address space.

## Extended Addresses:

In many circumstances, users will want a chain specific key that can be portable if needed. We can provide them access to these keys using the full BIP43/44 specifications.

> m / purpose' / coin_type' / account' / change / address_index

Purpose MUST follow the BIP44 specification and as such, be set to be `44`. `coin_type` MUST be supported according to the SLIP list. This will provide the greatest compatibility, especially if a user needs to exit the system.

Users MAY use these individual chain specific addresses.

This feature set provides compatibility with other wallets (eg. metamask),
allowing the user  to use the same seed in other wallets for any features or
integrations that are not present in web4 at launch (although we will work over
time to provide most of these features).

This is support is also critical for users who are importing HD seeds from other
software, so that we can locate existing tokens for that user. During the import
process, that user should be given a choice of supported tokens to add to the
list and the software can automatically derive the addresses that are already
used. In the case of many addresses, the user can use a `load more` button.

# Security Concerns

There are a few minor security concerns around Seed management and private key usage, these are addressed here.

## Persisting Seeds on Disk

Users will be forced to encrypt all HD Seeds kept on disk through their user
profile. Users will be given the option of a second layer of security by
encrypting each Seed separately.

## Private Keys Per Curve

We can reuse the same seed for each `Curve`, and derive different public/private
key pairs using the instructions found in SLIP-0010. Security concerns around
private key reuse are mitigated by using an HMAC-SHA512 pseudo random number
generator. This results in new private keys which are created for each curve.
This method is how Trezor and Ledger derive keys for different curves.