# Publication and domain handoff

> Recorded: 2026-08-29 UTC
>
> Status: `BUILD PASS / CANONICAL DNS + FOUNDER SIGNATURE OPEN`

## Authority boundary

This repository may build and deploy a non-indexed preview. It must not claim
that R1 official identity is closed until the Founder personally signs the
exact no-mint payload outside Git, chat, and CI. No maintainer, bot, automation,
or hosting service may synthesize that signature.

## Canonical domain

`k4cell.com` is the only canonical scientific site.

- `k4cell.org` is defensive and should redirect permanently to
  `https://k4cell.com/` after the canonical site passes HTTPS validation.
- `k4v.org` remains parked until a signed official K4V status page exists. It
  may then redirect to `https://k4cell.com/official-k4v/`; it must never become
  an independent token site.
- `k4cell.cn` may later redirect to `https://k4cell.com/zh/`.
- `tetractys.cn` and `eksmu.com` remain parked unless a later campaign gives
  them one explicit, non-canonical redirect role.

## Current `k4cell.com` DNS baseline

The domain uses DNSPod. Website records are absent. Existing mail records must
be preserved byte-for-byte through the website cutover.

```text
MX digest:       f21a47fca56105c29132395515e8a81a690e8635be625145e3d3577720aa7907
apex TXT digest: e342c59ae572c27a4b84f54a177d16048f0a0a9ba3768a4960debc204196a948
NS digest:       99c4517d2652fd0577e47db8b8d9ea947dcb9eefa074446104b6485975e90098
```

## GitHub Pages cutover

Perform in this order:

1. In GitHub account Pages settings, verify `k4cell.com`. Add the generated TXT
   challenge in DNSPod and retain it permanently.
2. Configure repository Pages for GitHub Actions and bind `k4cell.com` before
   routing traffic.
3. In DNSPod add only these website records:

```text
@    A      185.199.108.153
@    A      185.199.109.153
@    A      185.199.110.153
@    A      185.199.111.153
www  CNAME  magicknight.github.io
```

4. Do not replace the apex with a CNAME. The apex already carries mail-related
   records and must continue to do so.
5. Wait for Pages to report the certificate ready, then enable enforced HTTPS.
6. Recompute the MX, TXT, and NS digests and complete a real inbound/outbound
   mailbox check.

## Canonical publication flip

The preview build intentionally contains:

- `robots.txt` with `Disallow: /`;
- `noindex,nofollow,noarchive` HTML metadata;
- `X-Robots-Tag: noindex, nofollow, noarchive` for hosts that support `_headers`;
- machine status `PRELAUNCH_PREVIEW_NOINDEX`;
- no `/official-k4v/` directory.

Indexing and `/official-k4v/` are enabled only in one reviewed change after the
Founder signature and source graph pass. That change must update the HTML meta,
`robots.txt`, headers, status JSON, sitemap, and signed identity bytes together.

## Acceptance checks

```bash
gh api repos/magicknight/k4cell/pages \
  --jq '{status,html_url,cname,https_enforced,protected_domain_state}'

dig +short TXT _github-pages-challenge-magicknight.k4cell.com
dig +short A k4cell.com | sort
dig +short CNAME www.k4cell.com

curl -fsSIL https://k4cell.com/
curl -fsSIL https://www.k4cell.com/
curl -fsSL https://k4cell.com/status.json | jq .
```

## Rollback

1. For a content defect, revert the site commit and leave DNS unchanged.
2. For a domain-routing defect, first remove only the four new apex A records
   and the new `www` CNAME from DNSPod.
3. Preserve verification TXT, all MX/TXT mail records, and nameservers.
4. After DNS no longer routes traffic to Pages, detach the custom domain from
   Pages. Keep the repository and deployment history for repair.
