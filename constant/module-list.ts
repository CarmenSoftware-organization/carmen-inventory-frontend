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
  Shield,
  Network,
  ShieldCheck,
  UserCheck,
  ChefHat,
  UtensilsCrossed,
  Layers,
  BookOpen,
  Wrench,
  Files,
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
    name: "Config",
    path: "/config",
    icon: Settings2,
    subModules: [
      {
        name: "Adjustment Type",
        path: "/config/adjustment-type",
        icon: SlidersHorizontal,
      },
      {
        name: "Business Type",
        path: "/config/business-type",
        icon: Briefcase,
      },
      {
        name: "Currency",
        path: "/config/currency",
        icon: DollarSign,
      },
      {
        name: "Delivery Point",
        path: "/config/delivery-point",
        icon: MapPin,
      },
      {
        name: "Department",
        path: "/config/department",
        icon: Warehouse,
      },
      {
        name: "Exchange Rate",
        path: "/config/exchange-rate",
        icon: ArrowLeftRight,
      },
      {
        name: "Extra Cost",
        path: "/config/extra-cost",
        icon: Coins,
      },
      {
        name: "Store Location",
        path: "/config/location",
        icon: Building,
      },
      {
        name: "Tax Profile",
        path: "/config/tax-profile",
        icon: Receipt,
      },
      {
        name: "Unit",
        path: "/config/unit",
        icon: Scale,
      },
    ],
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
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
        name: "Period End",
        path: "/inventory-management/period-end",
        icon: Calendar,
      },
      {
        name: "Physical Count",
        path: "/inventory-management/physical-count",
        icon: ClipboardCheck,
      },
      {
        name: "Spot Check",
        path: "/inventory-management/spot-check",
        icon: Eye,
      },
    ],
  },
  {
    name: "Operational Planning",
    path: "/operation-plan",
    icon: ChefHat,
    subModules: [
      {
        name: "Category",
        path: "/operation-plan/category",
        icon: Layers,
      },
      {
        name: "Cuisine",
        path: "/operation-plan/cuisine",
        icon: UtensilsCrossed,
      },
      {
        name: "Equipment",
        path: "/operation-plan/equipment",
        icon: Wrench,
      },
      {
        name: "Recipe",
        path: "/operation-plan/recipe",
        icon: BookOpen,
      },
    ],
  },
  {
    name: "Procurement",
    path: "/procurement",
    icon: ShoppingCart,
    subModules: [
      {
        name: "My Approval",
        path: "/procurement/approval",
        icon: FileCheck,
      },
      {
        name: "Credit Note",
        path: "/procurement/credit-note",
        icon: FileInput,
      },
      {
        name: "Goods Receive Note",
        path: "/procurement/goods-receive-note",
        icon: PackageCheck,
      },
      {
        name: "Purchase Order",
        path: "/procurement/purchase-order",
        icon: ClipboardList,
      },
      {
        name: "Purchase Request",
        path: "/procurement/purchase-request",
        icon: FileText,
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
        name: "Category",
        path: "/product-management/category",
        icon: Tag,
      },
      {
        name: "Product",
        path: "/product-management/product",
        icon: Box,
      },
    ],
  },
  {
    name: "Store Operations",
    path: "/store-operation",
    icon: Store,
    subModules: [
      {
        name: "Stock Replenishment",
        path: "/store-operation/stock-replenishment",
        icon: PackagePlus,
      },
      {
        name: "Store Requisition",
        path: "/store-operation/store-requisition",
        icon: ListChecks,
      },
      {
        name: "Wastage Reporting",
        path: "/store-operation/wastage-reporting",
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
        name: "Document",
        path: "/system-admin/document",
        icon: FileCheck,
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
        name: "Workflow",
        path: "/system-admin/workflow",
        icon: Network,
      },
    ],
  },
  {
    name: "Vendor Management",
    path: "/vendor-management",
    icon: Handshake,
    subModules: [
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
      {
        name: "Vendor",
        path: "/vendor-management/vendor",
        icon: Building2,
      },
    ],
  },
  {
    name: "Report",
    path: "/report",
    icon: Files,
  },
];
