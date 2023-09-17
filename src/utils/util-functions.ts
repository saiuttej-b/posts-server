import { v4 } from 'uuid';

export function generateTimestampId() {
  return `${Date.now()}-${v4()}`;
}
