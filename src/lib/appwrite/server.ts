import { Account, Client, Databases, ID, Query, Storage } from 'node-appwrite';
import { appwriteConfig } from './config';

const serverClient = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setKey(process.env.APPWRITE_API_KEY || '');

export const serverDatabases = new Databases(serverClient);
export const serverStorage = new Storage(serverClient);
export const serverAccount = new Account(serverClient);

export { ID, Query, serverClient };
export default serverClient;
