export interface DeliveryPoint {
  id: string;
  name: string;
  is_active: boolean;
}

export interface UserLocation {
  id: string;
  firstname: string;
  lastname: string;
  middlename: string | null;
  telephone: string;
}

export interface ProductLocation {
  id: string;
  name: string | null;
  code: string | null;
  min_qty: number | null;
  max_qty: number | null;
  re_order_qty: number | null;
  par_qty: number | null;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  location_type: string;
  physical_count_type: string;
  description: string;
  is_active: boolean;
  info: Record<string, unknown>;
  user_location: UserLocation[];
  product_location: ProductLocation[];
  delivery_point: DeliveryPoint | null;
}
