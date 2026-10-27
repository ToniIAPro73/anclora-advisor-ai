import { createNeonServiceClient } from "../src/lib/neon/server-admin";
import * as dotenv from 'dotenv';
import * as path from 'path';
import { generateEmbeddingVector } from '../src/lib/ai/runtime';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const database = createNeonServiceClient();
async function test() {
  const query = 'qué gastos puedo deducirme de mi actividad como autónomo en las islas baleares?';
  const queryEmbedding = await generateEmbeddingVector(query);
  
  console.log(`Computed embedding of size: ${queryEmbedding.length}`);
  
  const { data, error } = await database.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.1,
    match_count: 5,
    filter_category: 'fiscal',
  });
  
  if (error) {
    console.error('RPC Error:', error);
  } else {
    console.log('RPC Returned Chunks:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('Top similarity from RPC:', data[0].similarity);
    }
  }
}

test().catch(console.error);
