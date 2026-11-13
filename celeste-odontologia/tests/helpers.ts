import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export const root = resolve(import.meta.dirname, '..');
export const publicFile = (p: string): string => resolve(root, 'public', p.replace(/^\//, ''));
export const fileExists = (p: string): boolean => existsSync(publicFile(p));
