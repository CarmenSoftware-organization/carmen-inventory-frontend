export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
