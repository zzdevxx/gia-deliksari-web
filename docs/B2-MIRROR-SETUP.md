# Backblaze B2 Disaster-Recovery Setup

This guide walks through enabling the B2 mirror script (`npm run mirror:b2`)
so GIA Deliksari photos are backed up outside Google Drive.

## Why

Google Drive is the gallery master archive. If the Drive account gets
compromised, quota-limited, or accidentally wiped, the public gallery loses
its source of truth. B2 gives us a second copy in cold storage at ~$0.005/GB/month
— pennies per year for our scale.

## Cost estimate

| Item | Free tier | Expected usage | Cost |
|---|---|---|---|
| Storage | 10 GB | ~180 MB/year | $0 (free tier) |
| Class B transactions (uploads, HEAD) | 2.5K/day | ~50/day | $0 (free tier) |
| Egress (downloads) | 1 GB/day | 0 (no downloads) | $0 |

**At our scale (≤50 photos/year, ≤300 KB each), the free tier covers us
for 5+ years before any cost.**

## Step 1 — Create B2 account

1. Go to https://www.backblaze.com/b2 and sign up
2. Verify email + enable 2FA (recommended)
3. Note your **Account ID** (visible in top-right of dashboard)

## Step 2 — Create Application Key

1. In B2 dashboard → **App Keys** → **Add a New Application Key**
2. Capabilities:
   - ✅ `listBuckets`
   - ✅ `listFiles`, `readFiles`, `writeFiles`, `deleteFiles`
   - ❌ Anything admin-related (don't grant more than needed)
3. Restrict to bucket: select `Create new bucket` (we'll create it next)
4. Save the `applicationKey` value shown **once** (you can't see it again)

## Step 3 — Create bucket

1. **Buckets** → **Create a Bucket**
2. Bucket name: `gia-deliksari-photos-mirror` (or your preferred name)
3. Privacy: **Private** (mirror is internal, not for direct public access)
4. Default encryption: ✅ enabled (Backblaze-managed)
5. Lifecycle: leave default (no auto-delete; we want the archive)
6. Note the **Endpoint** URL (looks like `https://<bucket-name>.s3.<region>.backblazeb2.com`)

## Step 4 — Set environment variables

Add to `.env.local` (local dev) or CI secrets:

```bash
B2_ACCOUNT_ID=<your-account-id>
B2_APPLICATION_KEY=<your-app-key>
B2_BUCKET_NAME=gia-deliksari-photos-mirror
```

## Step 5 — First run (dry-run)

Verify your setup without uploading anything:

```bash
DRY_RUN=1 npm run mirror:b2
# or
npm run mirror:b2 -- --dry-run
```

Expected output:
```
[b2-mirror] starting at 2026-XX-XX...
[b2-mirror] DRY RUN — no uploads, no B2 connections
[b2-mirror] would scan N files in Drive folder
  - photo1.jpg (123456 bytes, modified 2026-...)
  - photo2.jpg ...
[b2-mirror] would upload ~X.X MB total
```

If the file count looks right (matches what's in your Drive folder),
proceed to step 6.

## Step 6 — First real run

```bash
npm run mirror:b2
```

This will:
- List all images in your Google Drive gallery folder
- For each file, check if B2 already has a newer copy
- Upload new/modified files (skips unchanged — idempotent)
- Stream via S3-compatible API (no full file in memory)

First run uploads everything. Subsequent runs only upload deltas.

## Step 7 — Automate (optional)

Run periodically or integrate with a scheduled GitHub Actions workflow when needed.
For now, manual runs via `npm run mirror:b2` are sufficient.

## Verification

After first upload, log into B2 dashboard → your bucket → **Browse Files**.
You should see files under prefix `drive-mirror/<drive-file-id>/<name>`.

To restore from B2 (disaster scenario):

```bash
# List all mirrored files
aws s3 ls s3://<bucket-name>/drive-mirror/ \
  --endpoint-url https://<bucket-name>.s3.<region>.backblazeb2.com \
  --account-id <B2_ACCOUNT_ID> \
  --application-key <B2_APPLICATION_KEY>

# Download a single file
aws s3 cp s3://<bucket-name>/drive-mirror/<file-id>/<name> ./restore/ \
  --endpoint-url https://<bucket-name>.s3.<region>.backblazeb2.com
```

(Requires `aws-cli` installed; the endpoint + creds work for any S3 client.)

## Troubleshooting

**"No API key found"** — environment variable belum di-set di `.env.local`.

**"FATAL: missing env B2_ACCOUNT_ID"** — local `.env.local` not
populated, or script running outside Node 20+.

**Drive folder returns 0** — `GOOGLE_DRIVE_PUBLIC_FOLDER_ID` not set,
or the folder ID is wrong (should be the ID, not the URL).

**Files appear in B2 but with wrong content type** — edit
`scripts/mirror-drive-to-b2.mjs` line ~88 to add the desired
`ContentType` mapping.

## Recovery drill (recommended quarterly)

1. Pick 5 random files from B2 mirror
2. Download them via aws-cli (command above)
3. Verify they're identical to the Drive originals
4. Restore test complete — you're good

Add a recurring calendar event "B2 mirror recovery drill" to ensure
you actually do this.