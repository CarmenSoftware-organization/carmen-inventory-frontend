import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Settings2,
  Coins,
  Building,
  Store,
  Ruler,
  ShoppingCart,
  FileText,
  ClipboardList,
  PackageCheck,
  Package,
  Box,
  Tag,
} from "lucide-react";

interface ModuleDto {
  name: string;
  path: string;
  icon: LucideIcon;
  subModules?: ModuleDto[];
}

export const moduleList: ModuleDto[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Config",
    path: "/config",
    icon: Settings2,
    subModules: [
      {
        name: "Currency",
        path: "/config/currency",
        icon: Coins,
      },
      {
        name: "Department",
        path: "/config/department",
        icon: Building,
      },
      {
        name: "Store",
        path: "/config/store",
        icon: Store,
      },
      {
        name: "Unit",
        path: "/config/unit",
        icon: Ruler,
      },
    ],
  },
  {
    name: "Procurement",
    path: "/procurement",
    icon: ShoppingCart,
    subModules: [
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
];
