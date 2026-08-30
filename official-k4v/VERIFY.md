# Verify the Founder-signed K4V no-mint attestation

This verifies the exact statement published at
`https://k4cell.com/official-k4v/`. It proves that the detached signature was
made by the advertised OpenPGP signing subkey. It does not authorize a token
launch and does not establish any scientific claim.

## Frozen hashes

```text
K4V_NO_OFFICIAL_MINT_ATTESTATION_v1.txt
SHA-256 3D972BDAEC125196F5629485D1BEC3F80B4C64C234D547903051C73172063A15

K4V_NO_OFFICIAL_MINT_ATTESTATION_v1.txt.asc
SHA-256 83447C16556BA4F68C04C295FEFA8924B2E07D5115F5C08E7498C7C39775FD36
```

Expected primary fingerprint:

```text
C74953F60AD573F54A3FD06C72213914E4860F47
```

Expected signing-subkey fingerprint:

```text
0427411FA4820FDA5EBFB79B48D9A06D3C49431F
```

## GnuPG verification

Run from this directory. The temporary keyring keeps the check separate from
your normal trust database.

```bash
verification_home="$(mktemp -d)"
chmod 700 "$verification_home"

sha256sum K4V_NO_OFFICIAL_MINT_ATTESTATION_v1.txt \
  K4V_NO_OFFICIAL_MINT_ATTESTATION_v1.txt.asc

gpg --homedir "$verification_home" --batch \
  --import ../provenance/K4V_FOUNDER_OPENPGP_KEY_v2.asc

gpg --homedir "$verification_home" --batch --status-fd 1 \
  --verify K4V_NO_OFFICIAL_MINT_ATTESTATION_v1.txt.asc \
  K4V_NO_OFFICIAL_MINT_ATTESTATION_v1.txt
```

The machine-readable output must contain:

```text
GOODSIG 48D9A06D3C49431F Zhihua Liang <zhihua@k4cell.com>
VALIDSIG 0427411FA4820FDA5EBFB79B48D9A06D3C49431F ... C74953F60AD573F54A3FD06C72213914E4860F47
```

`GOODSIG` alone is insufficient. Accept only the complete signing-subkey and
primary fingerprints shown above. A warning that the key is not certified by
your personal trust database is normal; cryptographic validity and personal
trust are separate questions. The canonical domain and public repository are
the identity anchors for this project.
