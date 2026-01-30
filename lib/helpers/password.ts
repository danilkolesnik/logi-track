import { randomBytes } from 'crypto';

export function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) result += chars[bytes[i]! % chars.length];
  return result;
}
