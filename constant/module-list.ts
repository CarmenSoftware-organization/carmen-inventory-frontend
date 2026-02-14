import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Settings2,
  Coins,
  Building,
  ShoppingCart,
  FileText,
  ClipboardList,
  PackageCheck,
  Package,
  Box,
  Tag,
  FileCheck,
  FileInput,
  FileSpreadsheet,
  DollarSign,
  ArrowLeftRight,
  MapPin,
  Warehouse,
  Receipt,
  Briefcase,
  Scale,
  SlidersHorizontal,
  Handshake,
  Building2,
  BadgeDollarSign,
  Store,
  ListChecks,
  PackagePlus,
  AlertTriangle,
  ArrowUpDown,
  Eye,
  ClipboardCheck,
  Calendar,
  BarChart3,
  Calculator,
  Timer,
  Shield,
  Network,
  ShieldCheck,
  UserCheck,
  User,
} from "lucide-react";

interface ModuleDto {
  name: string;
  path: string;
  icon: LucideIcon;
  subModules?: ModuleDto[];
}

export function getModule(path: string): ModuleDto {
  const mod = moduleList.find((m) => m.path === path);
  if (!mod) throw new Error(`Module not found: ${path}`);
  return mod;
}

export const moduleList: ModuleDto[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    name: "Procurement",
    path: "/procurement",
    icon: ShoppingCart,
    subModules: [
      {
        name: "My Approval",
        path: "/procurement/my-approval",
        icon: FileCheck,
      },
      {
        name: "Purchase Request",
        path: "/procurement/purchase-request",
        icon: FileText,
      },
      {
        name: "Purchase Order",
        path: "/procurement/purchase-order",
        icon: ClipboardList,
      },
      {
        name: "Goods Receive Note",
        path: "/procurement/goods-receive-note",
        icon: PackageCheck,
      },
      {
        name: "Credit Note",
        path: "/procurement/credit-note",
        icon: FileInput,
      },
      {
        name: "Purchase Request Template",
        path: "/procurement/purchase-request-template",
        icon: FileSpreadsheet,
      },
    ],
  },
  {
    name: "Product Management",
    path: "/product-management",
    icon: Package,
    subModules: [
      {
        name: "Product",
        path: "/product-management/product",
        icon: Box,
      },
      {
        name: "Category",
        path: "/product-management/category",
        icon: Tag,
      },
    ],
  },
  {
    name: "Vendor Management",
    path: "/vendor-management",
    icon: Handshake,
    subModules: [
      {
        name: "Vendor",
        path: "/vendor-management/vendor",
        icon: Building2,
      },
      {
        name: "Price List",
        path: "/vendor-management/price-list",
        icon: BadgeDollarSign,
      },
      {
        name: "Price List Template",
        path: "/vendor-management/price-list-template",
        icon: FileSpreadsheet,
      },
      {
        name: "Request Price List",
        path: "/vendor-management/request-price-list",
        icon: FileSpreadsheet,
      },
    ],
  },
  {
    name: "Store Operations",
    path: "/store-operation",
    icon: Store,
    subModules: [
      {
        name: "Store Requisition",
        path: "/store-operation/store-requisition",
        icon: ListChecks,
      },
      {
        name: "Stock Replenishment",
        path: "/store-operation/stock-replenishment",
        icon: PackagePlus,
      },
      {
        name: "Wastage Reporting",
        path: "/store-operation/wastage-reporting",
        icon: AlertTriangle,
      },
    ],
  },
  {
    name: "Inventory Management",
    path: "/inventory-management",
    icon: Warehouse,
    subModules: [
      {
        name: "Inventory Adjustment",
        path: "/inventory-management/inventory-adjustment",
        icon: ArrowUpDown,
      },
      {
        name: "Spot Check",
        path: "/inventory-management/spot-check",
        icon: Eye,
      },
      {
        name: "Physical Count",
        path: "/inventory-management/physical-count",
        icon: ClipboardCheck,
      },
      {
        name: "Period End",
        path: "/inventory-management/period-end",
        icon: Calendar,
      },
      {
        name: "Stock Overview",
        path: "/inventory-management/stock-overview",
        icon: BarChart3,
      },
      {
        name: "Inventory Balance",
        path: "/inventory-management/inventory-balance",
        icon: Calculator,
      },
      {
        name: "Inventory Aging",
        path: "/inventory-management/inventory-aging",
        icon: Timer,
      },
      {
        name: "Stock Card",
        path: "/inventory-management/stock-card",
        icon: FileText,
      },
      {
        name: "Slow Moving",
        path: "/inventory-management/slow-moving",
        icon: AlertTriangle,
      },
    ],
  },
  {
    name: "System Administration",
    path: "/system-admin",
    icon: Shield,
    subModules: [
      {
        name: "Workflow",
        path: "/system-admin/workflow",
        icon: Network,
      },
      {
        name: "Role",
        path: "/system-admin/role",
        icon: ShieldCheck,
      },
      {
        name: "User",
        path: "/system-admin/user",
        icon: UserCheck,
      },
      {
        name: "Document",
        path: "/system-admin/document-management",
        icon: FileCheck,
      },
    ],
  },
  {
    name: "Config",
    path: "/config",
    icon: Settings2,
    subModules: [
      {
        name: "Currency",
        path: "/config/currency",
        icon: DollarSign,
      },
      {
        name: "Exchange Rate",
        path: "/config/exchange-rate",
        icon: ArrowLeftRight,
      },
      {
        name: "Delivery Point",
        path: "/config/delivery-point",
        icon: MapPin,
      },
      {
        name: "Store Location",
        path: "/config/store-location",
        icon: Building,
      },
      {
        name: "Department",
        path: "/config/department",
        icon: Warehouse,
      },
      {
        name: "Tax Profile",
        path: "/config/tax-profile",
        icon: Receipt,
      },
      {
        name: "Extra Cost",
        path: "/config/extra-cost",
        icon: Coins,
      },
      {
        name: "Business Type",
        path: "/config/business-type",
        icon: Briefcase,
      },
      {
        name: "Unit",
        path: "/config/unit",
        icon: Scale,
      },
      {
        name: "Adjustment Type",
        path: "/config/adjustment-type",
        icon: SlidersHorizontal,
      },
    ],
  },
  {
    name: "Profile",
    path: "/profile",
    icon: User,
  },
];
