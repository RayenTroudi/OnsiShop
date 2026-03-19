# Appwrite Keepalive System

A production-safe keepalive endpoint and GitHub Actions workflow to prevent Appwrite free-tier inactivity timeouts. Designed to work reliably even when optional secrets are missing, with clear logging and easy debugging.

## Overview

The Appwrite free tier imposes inactivity timeouts. The keepalive system maintains availability by periodically checking Appwrite health and database endpoints.

### Key Features

- ✅ **Production-safe**: Works without optional secrets (REQUIRE_CRON_SECRET is optional)
- ✅ **GitHub Actions ready**: Scheduled every 6 hours + manual trigger support
- ✅ **Clear logging**: Structured logs for easy debugging
- ✅ **Flexible authorization**: Optional token protection
- ✅ **Robust**: Handles missing env vars gracefully with explicit error messages
- ✅ **Lightweight**: Minimal Appwrite API calls

## Architecture

### Keepalive Endpoint: `/api/cron/appwrite-keepalive`

**Endpoint Details**

- Runtime: Node.js (server-only)
- Method: GET
- Max Duration: 60 seconds
- Response Format: JSON

**Functionality**

1. **Authorization Check** (optional)

   - If `REQUIRE_CRON_SECRET=true`: Requires `Authorization: Bearer CRON_SECRET`
   - If `REQUIRE_CRON_SECRET` is false or unset: Endpoint is open to all requests
   - Returns 401 if authorization fails

2. **Environment Validation**

   - Checks for required variables:
     - `NEXT_PUBLIC_APPWRITE_ENDPOINT`
     - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
     - `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
     - `APPWRITE_API_KEY`
   - Returns 500 with explicit missing-variable message if any are missing

3. **Health Checks**

   - `GET {APPWRITE_ENDPOINT}/health`
   - `GET {APPWRITE_ENDPOINT}/databases/{APPWRITE_DATABASE_ID}`
   - Both requests use Appwrite headers:
     - `X-Appwrite-Project: APPWRITE_PROJECT_ID`
     - `X-Appwrite-Key: APPWRITE_API_KEY`

4. **Response Format**

**Success (200)**

```json
{
  "success": true,
  "message": "Appwrite keepalive check successful",
  "checkedAt": "2025-03-19T10:30:45.123Z",
  "healthStatus": "healthy",
  "databaseId": "692701a8001283ad4a42",
  "databaseName": "Store"
}
```

**Error (500/503/401)**

```json
{
  "success": false,
  "error": "Descriptive error message",
  "checkedAt": "2025-03-19T10:30:45.123Z"
}
```

### GitHub Actions Workflow

**File**: `.github/workflows/appwrite-keepalive.yml`

**Triggers**

1. Scheduled: Every 6 hours (`0 */6 * * *`)
2. Manual: Workflow dispatch with optional `keepalive_url` input

**URL Resolution Priority**

1. Workflow dispatch input `keepalive_url`
2. Repository secret `KEEPALIVE_URL`
3. Repository variable `KEEPALIVE_URL`
4. Repository secret `NEXTAUTH_URL`
5. Repository variable `NEXTAUTH_URL`

**URL Normalization**

- If URL doesn't end with `/api/cron/appwrite-keepalive`, it's appended
- Example: `https://example.com` → `https://example.com/api/cron/appwrite-keepalive`

**Authorization**

- If `CRON_SECRET` is set in repository secrets, sends `Authorization: Bearer {CRON_SECRET}`
- If `CRON_SECRET` is not set, endpoint must be open (`REQUIRE_CRON_SECRET=false`)
- Workflow doesn't fail if `CRON_SECRET` is absent

**Failure Conditions**

- Keepalive URL cannot be resolved → Fails with clear message
- HTTP status is not 2xx → Fails with status and response body
- Includes troubleshooting hints in logs

## Setup Instructions

### Step 1: Deployment Environment Setup

Set these environment variables on your hosting platform (Vercel, Railway, etc.):

```bash
# Required
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
APPWRITE_API_KEY=your_api_key_DO_NOT_COMMIT

# Optional: Keepalive configuration
REQUIRE_CRON_SECRET=false
CRON_SECRET=your_secret_if_needed

# Optional: Keepalive URL (defaults to NEXTAUTH_URL)
KEEPALIVE_URL=https://your-app.com/api/cron/appwrite-keepalive
```

**⚠️ Security Notes**

- Never commit `APPWRITE_API_KEY` to version control
- These env vars are server-only and never exposed to client code
- `APPWRITE_API_KEY` is validated and never logged

### Step 2: GitHub Repository Setup

Add these to your GitHub repository:

**Secrets** (Settings → Secrets and variables → Actions → Secrets)

```
KEEPALIVE_URL=https://your-app.com/api/cron/appwrite-keepalive
CRON_SECRET=your_secure_token (optional, only if REQUIRE_CRON_SECRET=true)
NEXTAUTH_URL=https://your-app.com (fallback if KEEPALIVE_URL not set)
```

**Variables** (Settings → Secrets and variables → Actions → Variables)

```
KEEPALIVE_URL=https://your-app.com/api/cron/appwrite-keepalive (alternative to secret)
NEXTAUTH_URL=https://your-app.com (fallback if KEEPALIVE_URL not set)
```

### Step 3: Verify Setup

Choose one of the modes below based on your security requirements:

#### Mode A: Open Endpoint (No Authentication)

1. Set deployment env vars (without CRON_SECRET or set `REQUIRE_CRON_SECRET=false`)
2. Set GitHub Actions URL variable (KEEPALIVE_URL or NEXTAUTH_URL)
3. Workflow runs every 6 hours and calls endpoint without Authorization header

#### Mode B: Protected Endpoint (Requires Token)

1. Set deployment env vars:
   - `REQUIRE_CRON_SECRET=true`
   - `CRON_SECRET=your_secure_token`
2. Set GitHub repository secret:
   - `CRON_SECRET=your_secure_token` (same value)
   - `KEEPALIVE_URL=https://your-app.com/api/cron/appwrite-keepalive`
3. Workflow runs every 6 hours and calls endpoint with Authorization header

## Testing and Debugging

### Local Development

Start dev server:

```bash
npm run dev
```

#### Test Open Endpoint

```bash
curl -X GET http://localhost:3000/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json"
```

Expected success response:

```json
{
  "success": true,
  "message": "Appwrite keepalive check successful",
  "checkedAt": "2025-03-19T10:30:45.123Z",
  "healthStatus": "healthy",
  "databaseId": "692701a8001283ad4a42",
  "databaseName": "Store"
}
```

Expected failure (missing env vars):

```json
{
  "success": false,
  "error": "Environment validation failed: Missing required environment variable: APPWRITE_API_KEY"
}
```

#### Test Protected Endpoint

```bash
# Set REQUIRE_CRON_SECRET=true and CRON_SECRET=test123 locally

# Without token (should return 401)
curl -X GET http://localhost:3000/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json"

# With correct token
curl -X GET http://localhost:3000/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test123"

# With wrong token (should return 401)
curl -X GET http://localhost:3000/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer wrong"
```

### Production Testing

#### Via curl

Open endpoint:

```bash
curl -X GET https://your-app.com/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json" \
  -v
```

Protected endpoint:

```bash
curl -X GET https://your-app.com/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_cron_secret" \
  -v
```

#### Via GitHub Actions

Trigger manual workflow:

1. Go to repository → Actions → Appwrite Keepalive
2. Click "Run workflow"
3. (Optional) Enter custom `keepalive_url`
4. View logs in the workflow run

Example with custom URL:

1. Use `keepalive_url` input: `https://staging.example.com/api/cron/appwrite-keepalive`
2. Workflow will use this URL instead of secrets/variables

### Debugging Common Issues

**Issue: 401 Unauthorized**

- Check if `REQUIRE_CRON_SECRET=true` in deployment
- If yes, verify `CRON_SECRET` is set in GitHub repository secrets
- Verify token value matches in both deployment env and GitHub secret

**Issue: 500 Environment validation failed**

- Verify all required env vars are set in deployment:
  - `NEXT_PUBLIC_APPWRITE_ENDPOINT`
  - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
  - `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
  - `APPWRITE_API_KEY`
- Check variable names and values are correct

**Issue: 503 Health check failed**

- Verify `APPWRITE_ENDPOINT` is accessible from your deployment
- Check `APPWRITE_PROJECT_ID` and `APPWRITE_API_KEY` are valid
- Review Appwrite project health status

**Issue: GitHub workflow cannot reach URL**

- Verify URL is publicly accessible (not localhost/127.0.0.1)
- Check URL doesn't have trailing issues
- Ensure deployment env vars are set before workflow runs
- Review deployment logs for errors

**Issue: URL resolution failed in workflow**

- Ensure at least one of these is set in GitHub repository:
  - Secret: `KEEPALIVE_URL`
  - Variable: `KEEPALIVE_URL`
  - Secret: `NEXTAUTH_URL`
  - Variable: `NEXTAUTH_URL`
- Or provide via workflow dispatch `keepalive_url` input

## Monitoring

### Logs Location

**Local Development**

- Terminal output shows `[keepalive]` logs

**Vercel Deployment**

- Function logs at: https://vercel.com → Project → Deployments → Logs
- Search for `[keepalive]`

**Railway Deployment**

- Logs visible in: Project → Deployments → Logs
- Search for `[keepalive]`

**GitHub Actions Workflow**

- View at: Repository → Actions → Appwrite Keepalive → Latest Run
- Each check step shows detailed logs

### Log Format

Successful check:

```
[keepalive] Starting Appwrite health checks
[keepalive] All checks passed
```

Failed check:

```
[keepalive] Health check failed: HTTP 503 - Service Unavailable
```

Authorization failure:

```
[keepalive] Authorization failed: Unauthorized: Invalid or missing Authorization header
```

Environment failure:

```
[keepalive] Environment validation failed: Missing required environment variable: APPWRITE_API_KEY
```

## Acceptance Tests

### Test 1: Open Endpoint (Default)

**Setup**

- Deployment with `REQUIRE_CRON_SECRET=false` (or unset)
- GitHub Actions triggered

**Test**

```bash
curl -X GET https://your-app.com/api/cron/appwrite-keepalive
```

**Expected Result**

- HTTP 200
- JSON response with `success: true`
- No Authorization header needed

### Test 2: Protected Endpoint

**Setup**

- Deployment with `REQUIRE_CRON_SECRET=true` and `CRON_SECRET=secret123`
- GitHub Actions with secret `CRON_SECRET=secret123`

**Test Open Access**

```bash
curl -X GET https://your-app.com/api/cron/appwrite-keepalive
```

**Expected Result**

- HTTP 401
- JSON response with `success: false`

**Test With Token**

```bash
curl -X GET https://your-app.com/api/cron/appwrite-keepalive \
  -H "Authorization: Bearer secret123"
```

**Expected Result**

- HTTP 200
- JSON response with `success: true`

### Test 3: GitHub Actions Scheduled Run

**Setup**

- Repository with KEEPALIVE_URL set
- Workflow should run at next scheduled time

**Verification**

- Go to Actions → Appwrite Keepalive
- Latest workflow run should show ✅ Success
- Logs should show HTTP status 2xx
- Response body should show `success: true`

### Test 4: GitHub Actions Manual Dispatch

**Setup**

- Go to Actions → Appwrite Keepalive
- Click "Run workflow"

**Test Without Custom URL**

- Leave `keepalive_url` input empty
- Workflow uses KEEPALIVE_URL or NEXTAUTH_URL from secrets/variables
- Should succeed

**Test With Custom URL**

- Enter: `https://staging.example.com/api/cron/appwrite-keepalive`
- Workflow uses provided URL
- Should succeed (or fail with clear error if URL unreachable)

### Test 5: Error Handling

**Missing Env Vars**

- Remove `APPWRITE_API_KEY` from deployment
- Trigger keepalive check
- Expected: HTTP 500 with "Missing required environment variable" error

**Invalid Appwrite Config**

- Set `APPWRITE_PROJECT_ID` to invalid value
- Trigger keepalive check
- Expected: HTTP 503 with "Health check failed" error

**Unreachable URL**

- Trigger GitHub workflow with invalid URL
- Expected: Workflow fails with "Failed to resolve keepalive URL" message

## Frequently Asked Questions

**Q: How often should I run the keepalive check?**
A: Every 6 hours is recommended for Appwrite free tier. The default schedule runs at 00:00, 06:00, 12:00, 18:00 UTC.

**Q: Can I change the cron schedule?**
A: Yes, edit `.github/workflows/appwrite-keepalive.yml` line 6 with new cron expression.

**Q: Is my APPWRITE_API_KEY exposed?**
A: No, it only exists on the server side. It's never sent to client code or GitHub Actions logs.

**Q: What if CRON_SECRET is not set but REQUIRE_CRON_SECRET=true?**
A: Endpoint returns 401 with "Server misconfiguration" error. Set `CRON_SECRET` in env vars.

**Q: Can I run keepalive multiple times?**
A: Yes, running multiple checks per day is fine (doesn't hurt, uses minimal resources).

**Q: What happens if Appwrite is temporarily down?**
A: Workflow fails with clear error logs. You'll see the failure in GitHub Actions, and logs will show the exact Appwrite error.

**Q: Can I test the endpoint locally without all env vars?**
A: Yes, endpoint returns 500 with explicit error message listing missing variables.

## Related Files

- Endpoint: [src/app/api/cron/appwrite-keepalive/route.ts](../../../src/app/api/cron/appwrite-keepalive/route.ts)
- Workflow: [.github/workflows/appwrite-keepalive.yml](.github/workflows/appwrite-keepalive.yml)
- Environment Reference: See `.env.local` or deployment platform settings
