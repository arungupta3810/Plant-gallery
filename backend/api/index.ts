import express from 'express';
import { createApp } from '../src/main';

// Reuse the Express instance across warm invocations so we only bootstrap Nest
// once per serverless container.
const server = express();
let ready: Promise<void> | null = null;

async function bootstrapOnce(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const app = await createApp(server);
      await app.init();
    })();
  }
  return ready;
}

export default async function handler(req: express.Request, res: express.Response) {
  await bootstrapOnce();
  server(req, res);
}
