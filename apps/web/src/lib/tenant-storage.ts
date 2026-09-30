/** Browser drafts are scoped to the authenticated identity, never a legacy global key. */
let scope: string | null = null;
let generation = 0;
export function setStorageScope(value: string | null) {
  if (scope !== value) generation++;
  scope = value;
}
export function getStorageScope() { return scope; }
export function getStorageGeneration() { return generation; }
export const tenantStorage = {
  getItem(key: string): string | null {
    return scope && typeof window !== 'undefined' ? localStorage.getItem(`zd:v2:${scope}:${key}`) : null;
  },
  setItem(key: string, value: string) {
    if (!scope || typeof window === 'undefined') return;
    localStorage.setItem(`zd:v2:${scope}:${key}`, value);
  },
  removeItem(key: string) {
    if (scope && typeof window !== 'undefined') localStorage.removeItem(`zd:v2:${scope}:${key}`);
  },
};
