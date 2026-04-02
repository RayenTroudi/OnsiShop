/**
 * Delete men's wear products from Appwrite database.
 * Matches by title keywords — does NOT touch women's products.
 */

import * as dotenv from 'dotenv';
import { Client, Databases, Query } from 'node-appwrite';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const COLLECTION_ID = 'products';

// Keywords that indicate men's clothing — case-insensitive match against title/name
const MENS_KEYWORDS = [
  't-shirt',
  'tshirt',
  't shirt',
  'polo',
  'men',
  'man',
  'suit',
  'tie',
  'blazer',
  'trouser',
  'boxer',
  'brief',
  'undershirt',
  'cargo',
];

function isMensProduct(title: string, name: string): boolean {
  const text = `${title} ${name}`.toLowerCase();
  return MENS_KEYWORDS.some((kw) => text.includes(kw));
}

async function deleteMensProducts() {
  console.log('🔍 Scanning for men\'s wear products...\n');

  let cursor: string | undefined;
  let totalDeleted = 0;
  let totalSkipped = 0;

  do {
    const queries = [Query.limit(100)];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);

    for (const doc of response.documents) {
      const title = (doc.title || doc.name || '') as string;
      const name  = (doc.name  || doc.title || '') as string;

      if (isMensProduct(title, name)) {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id);
        totalDeleted++;
        console.log(`🗑️  Deleted: "${title}" (${doc.$id})`);
      } else {
        totalSkipped++;
      }
    }

    if (response.documents.length < 100) break;
    cursor = response.documents[response.documents.length - 1].$id;
  } while (cursor);

  console.log(`\n✅ Done — deleted ${totalDeleted} men's products, kept ${totalSkipped} products.`);
}

deleteMensProducts()
  .then(() => process.exit(0))
  .catch((err) => { console.error(err); process.exit(1); });
