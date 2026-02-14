export enum ADJUSTMENT_TYPE {
  STOCK_IN = "stock_in",
  STOCK_OUT = "stock_out",
}

export const ADJUSTMENT_TYPE_OPTIONS = [
  { label: "Stock In", value: ADJUSTMENT_TYPE.STOCK_IN },
  { label: "Stock Out", value: ADJUSTMENT_TYPE.STOCK_OUT },
] as const;
