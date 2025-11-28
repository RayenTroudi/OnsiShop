import { Account, Client, Databases, Storage } from 'appwrite';
import { appwriteConfig } from './config';

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);

export { client };
export default client;
