export interface Store {
  brand: string;
  storeCode: string;
  name: string;
  address?: string;
  telephone?: string;
  latitude?: number;
  longitude?: number;
  raw?: unknown;
}
