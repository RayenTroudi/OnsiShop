import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Appwrite Keepalive Endpoint
 *
 * Purpose: Prevent Appwrite free-tier inactivity by periodically hitting
 * health and database endpoints. Works in production without optional secrets.
 *
 * Authorization:
 * - If REQUIRE_CRON_SECRET=true: requires Authorization: Bearer CRON_SECRET
 * - If REQUIRE_CRON_SECRET=false or unset: endpoint is open to all requests
 *
 * Security: APPWRITE_API_KEY is server-only (never exposed to client)
 */

interface KeepAliveResponse {
  success: boolean;
  message?: string;
  error?: string;
  checkedAt?: string;
  healthStatus?: string;
  databaseId?: string;
  databaseName?: string;
  upstreamStatus?: number;
  upstreamBody?: string;
}

interface AppwriteHealthResponse {
  status: string;
  version?: string;
}

interface AppwriteDatabaseResponse {
  $id: string;
  name: string;
}

/**
 * Validate required environment variables
 */
function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const requiredVars = {
    NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    NEXT_PUBLIC_APPWRITE_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    APPWRITE_API_KEY: process.env.APPWRITE_API_KEY
  };

  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check authorization header if REQUIRE_CRON_SECRET is enabled
 */
function checkAuthorization(request: NextRequest): { authorized: boolean; error?: string } {
  const requireSecret = process.env.REQUIRE_CRON_SECRET?.toLowerCase() === 'true';

  if (!requireSecret) {
    // No authorization required
    return { authorized: true };
  }

  // Authorization is required
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || cronSecret.trim() === '') {
    // REQUIRE_CRON_SECRET is true but CRON_SECRET is not set
    return {
      authorized: false,
      error: 'Server misconfiguration: REQUIRE_CRON_SECRET=true but CRON_SECRET is not set'
    };
  }

  const authHeader = request.headers.get('authorization');
  const expectedHeader = `Bearer ${cronSecret}`;

  if (!authHeader || authHeader !== expectedHeader) {
    return {
      authorized: false,
      error: 'Unauthorized: Invalid or missing Authorization header'
    };
  }

  return { authorized: true };
}

/**
 * Perform Appwrite health check
 */
async function checkAppwriteHealth(
  endpoint: string,
  projectId: string,
  apiKey: string
): Promise<{ status: string; error?: string }> {
  const healthUrl = `${endpoint}/health`;

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey
      }
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      return {
        status: `HTTP ${response.status}`,
        error: `Health check failed: ${body || response.statusText}`
      };
    }

    const data: AppwriteHealthResponse = await response.json();
    return {
      status: data.status || 'healthy'
    };
  } catch (error) {
    return {
      status: 'error',
      error: `Health check error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Perform Appwrite database check
 */
async function checkAppwriteDatabase(
  endpoint: string,
  projectId: string,
  apiKey: string,
  databaseId: string
): Promise<{ id?: string; name?: string; error?: string }> {
  const dbUrl = `${endpoint}/databases/${databaseId}`;

  try {
    const response = await fetch(dbUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey
      }
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      return {
        error: `Database check failed: HTTP ${response.status} - ${body || response.statusText}`
      };
    }

    const data: AppwriteDatabaseResponse = await response.json();
    return {
      id: data.$id,
      name: data.name
    };
  } catch (error) {
    return {
      error: `Database check error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<KeepAliveResponse>> {
  // Step 1: Check authorization
  const authCheck = checkAuthorization(request);
  if (!authCheck.authorized) {
    console.error(`[keepalive] Authorization failed: ${authCheck.error}`);
    return NextResponse.json<KeepAliveResponse>(
      {
        success: false,
        error: authCheck.error
      },
      { status: 401 }
    );
  }

  // Step 2: Validate environment variables
  const envValidation = validateEnvironment();
  if (!envValidation.valid) {
    const errorMessage = `Environment validation failed: ${envValidation.errors.join('; ')}`;
    console.error(`[keepalive] ${errorMessage}`);
    return NextResponse.json<KeepAliveResponse>(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
  const apiKey = process.env.APPWRITE_API_KEY!;

  console.log('[keepalive] Starting Appwrite health checks', {
    endpoint: endpoint.replace(/\/v\d+$/, '') + '/v1',
    projectId: projectId.substring(0, 8) + '...',
    databaseId: databaseId.substring(0, 8) + '...'
  });

  try {
    // Step 3: Check Appwrite health endpoint
    const healthResult = await checkAppwriteHealth(endpoint, projectId, apiKey);

    if (healthResult.error) {
      console.error(`[keepalive] Health check failed: ${healthResult.error}`);
      return NextResponse.json<KeepAliveResponse>(
        {
          success: false,
          error: healthResult.error,
          checkedAt: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    // Step 4: Check Appwrite database endpoint
    const dbResult = await checkAppwriteDatabase(endpoint, projectId, apiKey, databaseId);

    if (dbResult.error) {
      console.error(`[keepalive] Database check failed: ${dbResult.error}`);
      return NextResponse.json<KeepAliveResponse>(
        {
          success: false,
          error: dbResult.error,
          checkedAt: new Date().toISOString(),
          healthStatus: healthResult.status
        },
        { status: 503 }
      );
    }

    // Step 5: All checks passed
    const response: KeepAliveResponse = {
      success: true,
      message: 'Appwrite keepalive check successful',
      checkedAt: new Date().toISOString(),
      healthStatus: healthResult.status,
      databaseId: dbResult.id,
      databaseName: dbResult.name
    };

    console.log('[keepalive] All checks passed', {
      healthStatus: response.healthStatus,
      databaseId: response.databaseId,
      databaseName: response.databaseName,
      checkedAt: response.checkedAt
    });

    return NextResponse.json<KeepAliveResponse>(response, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[keepalive] Unexpected error: ${errorMessage}`, error);

    return NextResponse.json<KeepAliveResponse>(
      {
        success: false,
        error: `Unexpected error: ${errorMessage}`,
        checkedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<KeepAliveResponse>> {
  // POST is not supported, redirect to GET documentation
  return NextResponse.json<KeepAliveResponse>(
    {
      success: false,
      error: 'Method not allowed. Use GET request: GET /api/cron/appwrite-keepalive'
    },
    { status: 405 }
  );
}
