# Founder signing-subkey test verification

This receipt verifies one narrow fact: on 2026-08-30, the K4 Cell Founder
signing subkey produced the detached signature distributed beside this file.
The signed payload explicitly says `NON_OFFICIAL_TEST_ONLY`; it is not a token
launch, mint authorization, presale announcement, or official K4V attestation.

## Frozen bytes

```text
SERVER_SIGNING_SUBKEY_TEST_v1.txt
SHA-256 32E1165F280EA1E4D225BBACCDB07987D17354745E694013239C0BFA824E0838

SERVER_SIGNING_SUBKEY_TEST_v1.txt.asc
SHA-256 AF453B85021C1980C25BE0247482FDBEBC5B37F2424BB960EEBA5BD86AB99E47
```

## Expected identity

```text
Primary fingerprint
C74953F60AD573F54A3FD06C72213914E4860F47

Signing-subkey fingerprint
0427411FA4820FDA5EBFB79B48D9A06D3C49431F
```

## Independent verification

Run from this directory with GnuPG installed. The temporary keyring keeps this
test separate from the verifier's normal OpenPGP trust database.

```bash
verification_home="$(mktemp -d)"
chmod 700 "$verification_home"

sha256sum SERVER_SIGNING_SUBKEY_TEST_v1.txt \
  SERVER_SIGNING_SUBKEY_TEST_v1.txt.asc

gpg --homedir "$verification_home" --batch \
  --import ../K4V_FOUNDER_OPENPGP_KEY_v2.asc

gpg --homedir "$verification_home" --batch --status-fd 1 \
  --verify SERVER_SIGNING_SUBKEY_TEST_v1.txt.asc \
  SERVER_SIGNING_SUBKEY_TEST_v1.txt
```

The machine-readable output must contain both:

```text
GOODSIG 48D9A06D3C49431F Zhihua Liang <zhihua@k4cell.com>
VALIDSIG 0427411FA4820FDA5EBFB79B48D9A06D3C49431F ... C74953F60AD573F54A3FD06C72213914E4860F47
```

`GOODSIG` alone is not the acceptance condition. The full `VALIDSIG` signing
subkey fingerprint and its primary-key fingerprint must match the values above.
