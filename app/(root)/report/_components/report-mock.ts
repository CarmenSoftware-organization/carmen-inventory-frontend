// TODO: ลบไฟล์นี้เมื่อ API พร้อม — เปลี่ยนไปใช้ useReport hook แทน

import type { Report, ReportType } from "@/types/report";

export const REPORT_FILTERS: ReportType[] = [
  "procurement",
  "recipe",
  "inventory",
  "other",
];

export const mockReports: Report[] = [
  // ── Procurement ────────────────────────────────────────
  { id: "RPT-001", name: "Credit Note Detail", type: "procurement" },
  { id: "RPT-002", name: "Deviation by Item", type: "procurement" },
  {
    id: "RPT-003",
    name: "Extra Cost Summary By Type",
    type: "procurement",
  },
  {
    id: "RPT-004",
    name: "Order Pending By Item Report",
    type: "procurement",
  },
  {
    id: "RPT-005",
    name: "Order Pending By Vendor Report",
    type: "procurement",
  },
  { id: "RPT-006", name: "PO Log Book Report", type: "procurement" },
  {
    id: "RPT-007",
    name: "Price List Detail by Product Report",
    type: "procurement",
  },
  {
    id: "RPT-008",
    name: "Pricelist Comparison by Vendor",
    type: "procurement",
  },
  {
    id: "RPT-009",
    name: "Purchase Analysis by Item Report",
    type: "procurement",
  },
  { id: "RPT-010", name: "Purchase Order By Department", type: "procurement" },
  { id: "RPT-011", name: "Purchase Order Detail by Date", type: "procurement" },
  {
    id: "RPT-012",
    name: "Purchase Request by Department",
    type: "procurement",
  },
  {
    id: "RPT-013",
    name: "Receiving Audit Report - (Committed Date)",
    type: "procurement",
  },
  {
    id: "RPT-014",
    name: "Receiving Daily Detailed Summary Report by Location Type",
    type: "procurement",
  },
  {
    id: "RPT-015",
    name: "Receiving Daily Summary by Location and Category",
    type: "procurement",
  },
  { id: "RPT-016", name: "Receiving Detail", type: "procurement" },
  {
    id: "RPT-017",
    name: "Receiving Detail with Currency",
    type: "procurement",
  },
  {
    id: "RPT-018",
    name: "Receiving Monthly Summary by Location and Category",
    type: "procurement",
  },
  {
    id: "RPT-019",
    name: "Receiving Monthly Summary by Receiving Date and Category",
    type: "procurement",
  },
  { id: "RPT-020", name: "Receiving Summary", type: "procurement" },
  {
    id: "RPT-021",
    name: "Receiving Summary with Currency",
    type: "procurement",
  },
  {
    id: "RPT-022",
    name: "Reject Purchase Request Report",
    type: "procurement",
  },
  { id: "RPT-023", name: "Summary Cost Receiving Report", type: "procurement" },
  { id: "RPT-024", name: "Top Receiving by Product", type: "procurement" },
  { id: "RPT-025", name: "Top Receiving by Vendor", type: "procurement" },
  {
    id: "RPT-026",
    name: "Total Purchase by Vendor Report",
    type: "procurement",
  },
  { id: "RPT-027", name: "Vat Report", type: "procurement" },
  { id: "RPT-028", name: "Vendor by Purchase Order", type: "procurement" },
  { id: "RPT-029", name: "Vendor Detailed", type: "procurement" },
  { id: "RPT-030", name: "Vendor List", type: "procurement" },

  // ── Inventory ──────────────────────────────────────────
  { id: "RPT-031", name: "End Of Month Balanced", type: "inventory" },
  { id: "RPT-032", name: "EOP Adjustment Report", type: "inventory" },
  { id: "RPT-033", name: "Inventory Aging Detailed", type: "inventory" },
  { id: "RPT-034", name: "Inventory Aging Summary", type: "inventory" },
  { id: "RPT-035", name: "Inventory Balance", type: "inventory" },
  {
    id: "RPT-036",
    name: "Inventory Balance Summary by Category",
    type: "inventory",
  },
  {
    id: "RPT-037",
    name: "Inventory Balance Summary by Item",
    type: "inventory",
  },
  { id: "RPT-038", name: "Inventory By ExpiryDate", type: "inventory" },
  {
    id: "RPT-039",
    name: "Inventory Movement Detailed By Product",
    type: "inventory",
  },
  {
    id: "RPT-040",
    name: "Inventory Movement Summary By Location",
    type: "inventory",
  },
  { id: "RPT-041", name: "Issue Detail", type: "inventory" },
  { id: "RPT-042", name: "Item Expiry", type: "inventory" },
  {
    id: "RPT-043",
    name: "Physical Count Qty Difference Report",
    type: "inventory",
  },
  { id: "RPT-044", name: "Slow Moving Report", type: "inventory" },
  { id: "RPT-045", name: "Stock Card Detailed", type: "inventory" },
  { id: "RPT-046", name: "Stock Card Summary", type: "inventory" },
  { id: "RPT-047", name: "Stock In Detail", type: "inventory" },
  { id: "RPT-048", name: "Stock Out Detail", type: "inventory" },
  {
    id: "RPT-049",
    name: "Store Requisition By Request Store Is Void",
    type: "inventory",
  },
  {
    id: "RPT-050",
    name: "Store Requisition By Request Store On Daily Summary Void",
    type: "inventory",
  },
  {
    id: "RPT-051",
    name: "Store Requisition By Request Store On Summary",
    type: "inventory",
  },
  {
    id: "RPT-052",
    name: "Store Requisition By Request Store On Summary (Show Void Only)",
    type: "inventory",
  },
  { id: "RPT-053", name: "Store Requisition Detail", type: "inventory" },
  {
    id: "RPT-054",
    name: "Store Requisition Details – Issue from any/some location",
    type: "inventory",
  },
  {
    id: "RPT-055",
    name: "Store Requisition Details – Request to any/some location",
    type: "inventory",
  },
  {
    id: "RPT-056",
    name: "Store Requisition Inventory - Summary (All)",
    type: "inventory",
  },
  {
    id: "RPT-057",
    name: "Store Requisition Inventory - Summary (Type Shipment)",
    type: "inventory",
  },
  {
    id: "RPT-058",
    name: "Store Requisition Inventory - Summary (Type Transfer)",
    type: "inventory",
  },
  {
    id: "RPT-059",
    name: "Store Requisition Summary – Issue from any/some location",
    type: "inventory",
  },
  { id: "RPT-060", name: "Transaction Summary", type: "inventory" },

  // ── Recipe ─────────────────────────────────────────────
  { id: "RPT-061", name: "Product Category", type: "recipe" },
  { id: "RPT-062", name: "Product List", type: "recipe" },

  // ── Other ──────────────────────────────────────────────
  { id: "RPT-063", name: "Project Job Function", type: "other" },
  { id: "RPT-064", name: "Store Location", type: "other" },
];
