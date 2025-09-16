'use client';

import { useEffect, useState } from 'react';

interface TestData {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  environment?: any;
}

export default function TestPage() {
  const [dbTest, setDbTest] = useState<TestData | null>(null);
  const [categoriesTest, setCategoriesTest] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runTests() {
      try {
        // Test database connectivity
        const dbResponse = await fetch('/api/test/db');
        const dbData = await dbResponse.json();
        setDbTest(dbData);

        // Test categories API
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategoriesTest(categoriesData);
        }
      } catch (error) {
        console.error('Test failed:', error);
        setDbTest({
          success: false,
          message: 'Client-side test failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setLoading(false);
      }
    }

    runTests();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Testing Database Connection...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Database & API Test Results</h1>
      
      {/* Database Test Results */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Database Connection Test</h2>
        {dbTest ? (
          <div>
            <div className={`p-4 rounded mb-4 ${dbTest.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Status:</strong> {dbTest.message}
            </div>
            
            {dbTest.success && dbTest.data && (
              <div>
                <h3 className="font-semibold mb-2">Data Counts:</h3>
                <ul className="mb-4">
                  <li>Users: {dbTest.data.counts.users}</li>
                  <li>Categories: {dbTest.data.counts.categories}</li>
                  <li>Site Content: {dbTest.data.counts.siteContent}</li>
                  <li>Translations: {dbTest.data.counts.translations}</li>
                </ul>
                
                <h3 className="font-semibold mb-2">Sample Data:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(dbTest.data.samples, null, 2)}
                </pre>
              </div>
            )}
            
            {dbTest.error && (
              <div className="bg-red-100 p-4 rounded mb-4">
                <strong>Error:</strong> {dbTest.error}
              </div>
            )}
            
            <h3 className="font-semibold mb-2">Environment:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm">
              {JSON.stringify(dbTest.environment, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-red-600">No database test results</div>
        )}
      </div>

      {/* Categories API Test */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Categories API Test</h2>
        {categoriesTest.length > 0 ? (
          <div>
            <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
              <strong>Success:</strong> Categories API working - {categoriesTest.length} categories found
            </div>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(categoriesTest, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded">
            <strong>Warning:</strong> No categories found or API failed
          </div>
        )}
      </div>
      
      {/* Browser Information */}
      <div className="p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Browser Environment</h2>
        <ul>
          <li><strong>User Agent:</strong> {navigator.userAgent}</li>
          <li><strong>Current URL:</strong> {window.location.href}</li>
          <li><strong>Hostname:</strong> {window.location.hostname}</li>
        </ul>
      </div>
    </div>
  );
}