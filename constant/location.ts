export enum INVENTORY_TYPE {
  INVENTORY = "inventory",
  DIRECT = "direct",
  CONSIGNMENT = "consignment",
}

export const INVENTORY_TYPE_OPTIONS = [
  { label: "Inventory", value: INVENTORY_TYPE.INVENTORY },
  { label: "Direct", value: INVENTORY_TYPE.DIRECT },
  { label: "Consignment", value: INVENTORY_TYPE.CONSIGNMENT },
] as const;

export const PHYSICAL_COUNT_TYPE_OPTIONS = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
] as const;
