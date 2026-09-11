import type { Request, Response } from 'express';
// @ts-ignore
import serverCjs from '../dist/server.cjs';

// Extract the Express application from the compiled production CommonJS bundle
const app = (serverCjs as any)?.app || (serverCjs as any)?.default?.app || (serverCjs as any)?.default || serverCjs;

export { app };

export default function handler(req: Request, res: Response) {
  return app(req, res);
}
