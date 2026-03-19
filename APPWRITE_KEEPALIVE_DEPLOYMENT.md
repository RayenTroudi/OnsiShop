# Appwrite Keepalive Deployment Checklist

Complete this checklist when deploying the keepalive system to production.

## Pre-Deployment

### Code Review

- [ ] Review `/src/app/api/cron/appwrite-keepalive/route.ts`
- [ ] Review `.github/workflows/appwrite-keepalive.yml`
- [ ] Verify TypeScript compilation: `npm run build`

### Environment Variables Verified

- [ ] `NEXT_PUBLIC_APPWRITE_ENDPOINT` is set
- [ ] `NEXT_PUBLIC_APPWRITE_PROJECT_ID` is set
- [ ] `NEXT_PUBLIC_APPWRITE_DATABASE_ID` is set
- [ ] `APPWRITE_API_KEY` is set (server-only)
- [ ] `REQUIRE_CRON_SECRET` is set (`false` for open, `true` for protected)
- [ ] If `REQUIRE_CRON_SECRET=true`, `CRON_SECRET` is set

## Deployment Execution

### Local Testing First

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Test open endpoint (should return 200)
curl -X GET http://localhost:3000/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json"
```

- [ ] Test endpoint works locally
- [ ] Response includes `success: true`
- [ ] No auth errors if endpoint is open

### Deploy to Production

- [ ] Push code to main branch
- [ ] Verify GitHub Actions have access to repository
- [ ] Wait for deployment to complete
- [ ] Verify application is healthy

## Post-Deployment

### GitHub Actions Setup

1. Go to repository Settings → Secrets and variables → Actions

**Add Secrets:**

- [ ] `KEEPALIVE_URL` (copy from deployment URL + `/api/cron/appwrite-keepalive`)
- [ ] `CRON_SECRET` (only if `REQUIRE_CRON_SECRET=true`)
- [ ] `NEXTAUTH_URL` (same as deploy URL, used as fallback)

**Add Variables:**

- [ ] `KEEPALIVE_URL` (alternative to secret) OR
- [ ] `NEXTAUTH_URL` (fallback URL)

### Verify Production Endpoint

Test open endpoint:

```bash
curl -X GET https://your-production-url.com/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json" \
  -v
```

- [ ] HTTP status is 200
- [ ] Response contains `success: true`
- [ ] `healthStatus` shows `healthy`
- [ ] `databaseId` matches configuration
- [ ] `checkedAt` timestamp is recent

Test protected endpoint (if `REQUIRE_CRON_SECRET=true`):

```bash
# Without token - should fail
curl -X GET https://your-production-url.com/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json" \
  -v

# With correct token
curl -X GET https://your-production-url.com/api/cron/appwrite-keepalive \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -v
```

- [ ] Returns 401 without token
- [ ] Returns 200 with correct token
- [ ] Returns 401 with incorrect token

### Verify GitHub Actions Workflow

1. Go to repository → Actions → Appwrite Keepalive workflow
2. Trigger manual run: Click "Run workflow"
3. Monitor execution

- [ ] Workflow starts successfully
- [ ] Resolves keepalive URL correctly
- [ ] Shows final ping URL in logs
- [ ] HTTP status in response is 2xx
- [ ] Workflow completes with ✅ success

### Monitor First Scheduled Run

1. Go to Actions → Appwrite Keepalive
2. Wait for next scheduled run (every 6 hours)
3. Verify logs show successful ping

- [ ] Workflow runs at scheduled time
- [ ] All steps complete successfully
- [ ] Logs show keepalive endpoint response

## Production Monitoring

### Check Logs Regularly

**Vercel Logs**

1. Go to Vercel Project → Deployments → Logs
2. Filter for `[keepalive]` messages
3. Monitor for errors

**Railway Logs**

1. Go to Railway Project → Deployments → Logs
2. Filter for `[keepalive]` messages
3. Monitor for errors

**GitHub Actions Logs**

1. Go to Actions → Appwrite Keepalive
2. Review latest runs
3. Look for failures or warnings

### Set Up Alerts (Optional)

For critical deployments, consider setting up alerts if:

- [ ] Workflow fails to run
- [ ] Endpoint returns error status
- [ ] Multiple consecutive failures occur

### Scheduled Check Points

- [ ] **Daily**: Review workflow runs completed in Actions
- [ ] **Weekly**: Check endpoint logs for any patterns
- [ ] **Monthly**: Verify scheduled runs are completing normally

## Troubleshooting

### Workflow Cannot Resolve URL

**Symptoms**: Workflow fails with "Could not resolve keepalive URL"

**Fix:**

1. Go to repository Settings → Secrets and variables → Actions
2. Verify at least one URL is set:
   - Secret: `KEEPALIVE_URL`
   - Variable: `KEEPALIVE_URL`
   - Secret: `NEXTAUTH_URL`
   - Variable: `NEXTAUTH_URL`
3. Re-run workflow

### Endpoint Returns 401 Unauthorized

**Symptoms**: Workflow shows HTTP 401 in logs

**Possible causes:**

1. `REQUIRE_CRON_SECRET=true` but `CRON_SECRET` not set in GitHub secrets

   - Fix: Add `CRON_SECRET` to GitHub repository secrets

2. `CRON_SECRET` value doesn't match between deployment and GitHub

   - Fix: Update GitHub secret to match deployment value

3. GitHub secret exists but workflow isn't using it
   - Fix: Check workflow file `.github/workflows/appwrite-keepalive.yml` line 55

### Endpoint Returns 500 - Environment Validation Failed

**Symptoms**: Workflow shows "Missing required environment variable"

**Fix:**

1. Verify all Appwrite env vars in deployment:
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT`
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
   - `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
   - `APPWRITE_API_KEY`
2. Check variable names are exact (case-sensitive)
3. Verify values are not empty
4. Redeploy after fixing env vars

### Endpoint Returns 503 - Health Check Failed

**Symptoms**: Endpoint returns 503 with "Health check failed"

**Possible causes:**

1. Appwrite is temporarily down - wait and retry
2. `APPWRITE_ENDPOINT` URL is incorrect - verify it
3. `APPWRITE_PROJECT_ID` or `APPWRITE_API_KEY` is invalid - check credentials
4. Network connectivity issue between deployment and Appwrite

**Fix:**

1. Test Appwrite status: `curl https://fra.cloud.appwrite.io/v1/health`
2. Verify credentials in Appwrite console
3. Check deployment region can reach Appwrite cloud
4. Review deployment error logs

### Workflow Keeps Retrying

**Symptoms**: Multiple automatic retries of workflow runs

**Possible causes:**

1. Temporary network issue - usually resolves on next run
2. Appwrite temporarily down - check Appwrite status page
3. Deployment not responding - check deployment health

**Fix:**

1. Monitor next scheduled run (in 6 hours)
2. If persists, check deployment logs
3. Verify Appwrite cloud status

## Rollback Plan

If keepalive system causes issues:

1. **Disable workflow temporarily:**

   - Go to `.github/workflows/appwrite-keepalive.yml`
   - Add `enabled: false` to workflow

2. **Disable endpoint for access:**

   - Set `REQUIRE_CRON_SECRET=true` and remove `CRON_SECRET` from deployment
   - This causes endpoint to return 401, preventing accidental calls

3. **Redeploy without keepalive:**
   - Delete `.github/workflows/appwrite-keepalive.yml`
   - Delete `/src/app/api/cron/appwrite-keepalive/` directory
   - Push and deploy

## Sign-Off

- [ ] All checks above completed
- [ ] Endpoint tested and working
- [ ] GitHub Actions configured and tested
- [ ] First scheduled run completed successfully
- [ ] Documentation reviewed and understood
- [ ] Team notified of keepalive system deployment

**Deployed by:** ********\_******** **Date:** ******\_******

**Verified by:** ********\_******** **Date:** ******\_******
