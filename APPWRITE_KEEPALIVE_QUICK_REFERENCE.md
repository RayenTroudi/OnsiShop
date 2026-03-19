# Keepalive System - Quick Reference

## Files Created/Modified

### New Files

- `src/app/api/cron/appwrite-keepalive/route.ts` - Keepalive endpoint
- `.github/workflows/appwrite-keepalive.yml` - GitHub Actions workflow
- `APPWRITE_KEEPALIVE.md` - Complete documentation
- `APPWRITE_KEEPALIVE_DEPLOYMENT.md` - Deployment checklist
- `.env.example` - Environment variables reference (updated)

### No Files Deleted

## Test Commands

### Local Development

Start server:

```bash
npm run dev
```

#### Open Endpoint Mode (Default)

```bash
# Test endpoint without auth
curl -X GET http://localhost:3000/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json"

# Expected response (200 on success):
{
  "success": true,
  "message": "Appwrite keepalive check successful",
  "checkedAt": "2025-03-19T10:30:45.123Z",
  "healthStatus": "healthy",
  "databaseId": "692701a8001283ad4a42",
  "databaseName": "Store"
}

# Expected response (500 if env vars missing):
{
  "success": false,
  "error": "Environment validation failed: Missing required environment variable: APPWRITE_API_KEY"
}
```

#### Protected Endpoint Mode

First, set local env vars:

```bash
# Add to .env.local
REQUIRE_CRON_SECRET=true
CRON_SECRET=test123
```

Tests:

```bash
# Test without token - should return 401
curl -X GET http://localhost:3000/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json"

# Test with correct token
curl -X GET http://localhost:3000/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test123"

# Test with wrong token - should return 401
curl -X GET http://localhost:3000/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer wrong"
```

### Production Testing

#### Open Endpoint Mode

```bash
curl -X GET https://your-production-url.com/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json" \
  -H "User-Agent: curl" \
  -v
```

Expected: HTTP 200 with `success: true`

#### Protected Endpoint Mode

```bash
# Without auth - should fail
curl -X GET https://your-production-url.com/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json" \
  -v

# With auth - should succeed
curl -X GET https://your-production-url.com/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET_VALUE" \
  -v
```

### GitHub Actions Workflow Test

#### Manual Trigger (Recommended for Testing)

Via GitHub UI:

1. Go to repository → Actions
2. Select "Appwrite Keepalive" workflow
3. Click "Run workflow"
4. Optionally enter custom `keepalive_url`
5. Click "Run workflow" button

Via GitHub CLI:

```bash
# List workflows
gh workflow list

# Run workflow with default URL from secrets/variables
gh workflow run appwrite-keepalive.yml

# Run workflow with custom URL
gh workflow run appwrite-keepalive.yml -f keepalive_url=https://staging.example.com/api/cron/appwrite-keepalive

# View recent run
gh workflow view appwrite-keepalive.yml --repo your-org/your-repo
```

#### View Workflow Results

In GitHub UI:

1. Go to Actions → Appwrite Keepalive
2. Click on workflow run
3. Expand "Perform keepalive check" step
4. Review logs for status and response body

## Environment Variables for Deployment

### Minimum Required (Open Endpoint)

Set these in your deployment platform:

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
APPWRITE_API_KEY=your_api_key
REQUIRE_CRON_SECRET=false
```

### With Protection (Optional)

Add these for protected endpoint:

```bash
REQUIRE_CRON_SECRET=true
CRON_SECRET=your_secure_random_token
```

### GitHub Actions Configuration

Add to repository Secrets (Settings → Secrets and variables → Actions):

```
KEEPALIVE_URL=https://your-production-url.com/api/cron/appwrite-keepalive
CRON_SECRET=your_cron_secret (only if protected)
NEXTAUTH_URL=https://your-production-url.com (fallback if KEEPALIVE_URL missing)
```

Or add to Variables instead of Secrets:

```
KEEPALIVE_URL=https://your-production-url.com/api/cron/appwrite-keepalive
NEXTAUTH_URL=https://your-production-url.com
```

## Verification Checklist

- [ ] Endpoint accessible: `curl https://your-url.com/api/cron/appwrite-keepalive`
- [ ] Response status is 200 or 401 (not 500)
- [ ] Response is valid JSON with `success` field
- [ ] GitHub Actions workflow appears in Actions tab
- [ ] Can trigger workflow manually without errors
- [ ] Workflow logs show final ping URL
- [ ] Workflow logs show HTTP status 2xx

## Common Status Codes

| Status | Meaning                | Action                              |
| ------ | ---------------------- | ----------------------------------- |
| 200    | ✅ Success             | Normal operation                    |
| 401    | 🔐 Unauthorized        | Check CRON_SECRET if protected mode |
| 405    | ❌ Method not allowed  | Use GET, not POST                   |
| 500    | ❌ Server error        | Check deployment logs               |
| 503    | ⚠️ Service unavailable | Check Appwrite status               |

## Response Fields

**Success Response (HTTP 200)**

```json
{
  "success": true,
  "message": "Appwrite keepalive check successful",
  "checkedAt": "ISO timestamp",
  "healthStatus": "healthy | HTTP error message",
  "databaseId": "your_database_id",
  "databaseName": "your_database_name"
}
```

**Error Response (HTTP 401/500/503)**

```json
{
  "success": false,
  "error": "descriptive error message",
  "checkedAt": "ISO timestamp"
}
```

## Logs

### Local Development

Check terminal where `npm run dev` is running:

```
[keepalive] Starting Appwrite health checks
[keepalive] All checks passed
```

### Vercel/Production

1. Go to Vercel dashboard → Project → Deployments → Logs
2. Search for `[keepalive]`

### GitHub Actions

1. Go to Actions → workflow run
2. Click steps to expand logs
3. Look for "Perform keepalive check" step

## Troubleshooting

**Endpoint returns 500 with "Missing required environment variable"**
→ Check all APPWRITE\_\* vars are set in deployment

**Endpoint returns 401 Unauthorized**
→ If `REQUIRE_CRON_SECRET=true`, check `CRON_SECRET` matches GitHub secret

**GitHub workflow shows "URL cannot be resolved"**
→ Check `KEEPALIVE_URL` or `NEXTAUTH_URL` set in GitHub repository Secrets/Variables

**Endpoint returns 503 Health check failed**
→ Check Appwrite is accessible, verify credentials

## Documentation

- **Full Documentation**: Read `APPWRITE_KEEPALIVE.md`
- **Deployment Steps**: Follow `APPWRITE_KEEPALIVE_DEPLOYMENT.md`
- **Environment Reference**: See `.env.example`

## Support

For issues, check:

1. Deployment logs (Vercel/Railway/etc)
2. GitHub Actions workflow logs
3. Full documentation in `APPWRITE_KEEPALIVE.md`
4. Appwrite status page (https://status.appwrite.io)
