import { verifyAuth } from '@/lib/appwrite/auth';
import { UploadService } from '@/lib/uploadService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadType = searchParams.get('type') as any;
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit');

    // Get uploads based on query parameters
    let uploads;
    
    if (userId) {
      uploads = await UploadService.getUploadsByUser(userId, uploadType);
    } else if (uploadType) {
      uploads = await UploadService.getUploadsByType(uploadType, limit ? parseInt(limit) : undefined);
    } else {
      uploads = await UploadService.getRecentUploads(limit ? parseInt(limit) : 10);
    }

    return NextResponse.json({
      success: true,
      uploads,
      count: uploads.length
    });

  } catch (error: any) {
    console.error('❌ Failed to fetch uploads:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch uploads',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, uploadId, metadata } = body;

    switch (action) {
      case 'update':
        if (!uploadId) {
          return NextResponse.json(
            { success: false, error: 'Upload ID required' },
            { status: 400 }
          );
        }

        const updatedUpload = await UploadService.updateUpload(uploadId, metadata);
        if (!updatedUpload) {
          return NextResponse.json(
            { success: false, error: 'Upload not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          upload: updatedUpload
        });

      case 'delete':
        if (!uploadId) {
          return NextResponse.json(
            { success: false, error: 'Upload ID required' },
            { status: 400 }
          );
        }

        const deleted = await UploadService.deleteUpload(uploadId);
        if (!deleted) {
          return NextResponse.json(
            { success: false, error: 'Upload not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Upload deleted successfully'
        });

      case 'stats':
        // Admin only
        if (user.role !== 'admin') {
          return NextResponse.json(
            { success: false, error: 'Admin access required' },
            { status: 403 }
          );
        }

        const stats = await UploadService.getUploadStats();
        return NextResponse.json({
          success: true,
          stats
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('❌ Upload management error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Upload management failed',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('id');

    if (!uploadId) {
      return NextResponse.json(
        { success: false, error: 'Upload ID required' },
        { status: 400 }
      );
    }

    const deleted = await UploadService.deleteUpload(uploadId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Upload not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Upload deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Failed to delete upload:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete upload',
        message: error.message 
      },
      { status: 500 }
    );
  }
}