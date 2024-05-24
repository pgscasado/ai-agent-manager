import { Document, MongoClient } from 'mongodb';
const client = new MongoClient(process.env.DATABASE_URL || '');

export const { connect } = client;
export const db = client.db(process.env.DATABASE_NAME);

export async function openCollection<T extends Document = Document>(collectionName: string) {
  if (!(await db.listCollections().toArray()).map(v => v.name).includes(collectionName)) {
    await db.createCollection(collectionName);
  }
  return db.collection<T>(collectionName);
}

export * as mongo from './database'