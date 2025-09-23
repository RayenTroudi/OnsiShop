"use client";

import type { OurFileRouter } from "@/lib/uploadthing";
import { UploadButton } from "@uploadthing/react";

export default function TestUploadThing() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">UploadThing Test Page</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-yellow-800">⚠️ Debugging Upload Issue</h2>
        <p className="text-yellow-700 text-sm mt-1">
          This page tests UploadThing directly to identify why base64 URLs are being saved instead of proper UploadThing URLs.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Direct UploadThing Test</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <UploadButton<OurFileRouter, "heroVideoUploader">
              endpoint="heroVideoUploader"
              onClientUploadComplete={(res) => {
                console.log("🎯 Direct UploadThing Response:", res);
                
                if (res?.[0]) {
                  const file = res[0];
                  console.log("📄 File object:", file);
                  console.log("🔗 File URL:", file.url);
                  console.log("🏷️ File name:", file.name);
                  console.log("📏 File size:", file.size);
                  
                  // Check URL format
                  if (file.url?.startsWith('data:')) {
                    console.error("❌ PROBLEM: Received base64 data URL!");
                    alert(`❌ ERROR: Received base64 URL instead of UploadThing URL!\n\nURL: ${file.url.substring(0, 100)}...`);
                  } else if (file.url?.includes('uploadthing') || file.url?.includes('utfs.io')) {
                    console.log("✅ SUCCESS: Received proper UploadThing URL!");
                    alert(`✅ SUCCESS: Proper UploadThing URL received!\n\nURL: ${file.url}`);
                  } else {
                    console.warn("⚠️ WARNING: Unknown URL format");
                    alert(`⚠️ WARNING: Unknown URL format\n\nURL: ${file.url}`);
                  }
                } else {
                  console.error("❌ No file data received");
                  alert("❌ ERROR: No file data received");
                }
              }}
              onUploadError={(error) => {
                console.error("❌ Upload error:", error);
                alert(`❌ Upload Error: ${error.message}`);
              }}
              onUploadBegin={() => {
                console.log("📤 Upload started...");
              }}
              appearance={{
                button: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              }}
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">🔍 Debug Information</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            <p><strong>Expected UploadThing URL format:</strong> https://utfs.io/... or https://uploadthing.com/...</p>
            <p><strong>Problem URL format:</strong> data:video/mp4;base64,...</p>
            <p><strong>What to check:</strong> Browser console, Network tab, UploadThing dashboard</p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">📋 Test Instructions</h3>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Open browser Developer Tools (F12)</li>
            <li>Go to Console tab to see debug messages</li>
            <li>Go to Network tab to see upload requests</li>
            <li>Upload a small video file using the button above</li>
            <li>Check if the URL starts with "data:" (bad) or "https://utfs.io/" (good)</li>
            <li>Check Network tab for requests to UploadThing servers</li>
            <li>Check UploadThing dashboard for uploaded files</li>
          </ol>
        </div>
      </div>
    </div>
  );
}