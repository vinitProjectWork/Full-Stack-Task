import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`\n  Server running on http://localhost:${env.PORT}`);
  console.log(`  Environment : ${env.SQUARE_ENVIRONMENT}`);
  console.log(`  Cache TTL   : ${env.CACHE_TTL_SECONDS}s\n`);
});
