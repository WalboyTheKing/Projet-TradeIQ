import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let cachedApp: any = null;

// Safe dirname helper compatible with both ESM (Node/Vercel) and CJS
const getDirname = () => {
  try {
    if (typeof import.meta !== 'undefined' && typeof import.meta.url === 'string') {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {
    // Ignore in CJS context
  }
  return typeof __dirname !== 'undefined' ? __dirname : process.cwd();
};

async function getExpressApp() {
  if (cachedApp) return cachedApp;

  // Signal serverless runtime so server.ts avoids duplicate listeners
  if (!process.env.VERCEL) {
    process.env.VERCEL = '1';
  }

  const appDir = getDirname();

  // Search candidate paths for the production bundle on Vercel and local runtimes
  const candidatePaths = [
    path.join(process.cwd(), 'dist', 'server.cjs'),
    path.resolve(appDir, '..', 'dist', 'server.cjs'),
    path.resolve(appDir, 'dist', 'server.cjs'),
    '/var/task/dist/server.cjs',
  ];

  for (const bundlePath of candidatePaths) {
    if (fs.existsSync(bundlePath)) {
      try {
        const mod = require(bundlePath);
        cachedApp = mod.app || mod.default?.app || mod.default || mod;
        if (typeof cachedApp === 'function') {
          return cachedApp;
        }
      } catch (err: any) {
        console.warn(`[Vercel Serverless] Failed loading bundle at ${bundlePath}:`, err.message);
      }
    }
  }

  // Fallback 1: Dynamic ESM import of bundled or built server
  try {
    const mod: any = await import('../dist/server.cjs')
      .catch(async () => import('../server.js'))
      .catch(async () => import('../server'));
    cachedApp = mod.app || mod.default?.app || mod.default || mod;
    if (typeof cachedApp === 'function') {
      return cachedApp;
    }
  } catch (err: any) {
    console.error('[Vercel Serverless] Fallback server import failed:', err.message);
  }

  throw new Error('Express application could not be loaded from dist/server.cjs or server bundle.');
}

export default async function handler(req: Request, res: Response) {
  try {
    const app = await getExpressApp();
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Handler Exception]', err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      success: false,
      error: 'Vercel backend initialization error: ' + (err?.message || 'Unknown'),
    });
  }
}
