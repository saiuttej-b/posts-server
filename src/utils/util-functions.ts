import { v4 } from 'uuid';

export function generateTimestampId() {
  return `${Date.now()}-${v4()}`;
}

export function generateId() {
  return v4();
}

export function getSetDefaultFn(defaultValue: any) {
  return (value: any) => {
    if (value === undefined) return defaultValue;
    if (value === null) return defaultValue;
    return value;
  };
}
