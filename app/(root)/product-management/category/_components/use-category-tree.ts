import { useState, useEffect, useCallback } from "react";
import {
  NODE_TYPE,
  type CategoryDto,
  type SubCategoryDto,
  type ItemGroupDto,
  type CategoryNode,
} from "@/types/category";

interface UseCategoryTreeProps {
  categories: CategoryDto[];
  subCategories: SubCategoryDto[];
  itemGroups: ItemGroupDto[];
  isLoading: boolean;
}

export function useCategoryTree({
  categories,
  subCategories,
  itemGroups,
  isLoading,
}: UseCategoryTreeProps) {
  const [categoryData, setCategoryData] = useState<CategoryNode[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const buildCategoryTree = useCallback(() => {
    if (!categories || !subCategories || !itemGroups) return [];

    const mapItemGroups = (subcategoryId: string): CategoryNode[] => {
      const parentSub = subCategories.find((s) => s.id === subcategoryId);
      return itemGroups
        .filter((ig) => ig.product_subcategory_id === subcategoryId)
        .map((ig) => ({
          id: ig.id,
          code: ig.code,
          name: ig.name,
          description: ig.description,
          type: NODE_TYPE.ITEM_GROUP,
          children: [],
          product_subcategory_id: ig.product_subcategory_id,
          is_active: ig.is_active,
          price_deviation_limit: ig.price_deviation_limit,
          qty_deviation_limit: ig.qty_deviation_limit,
          is_used_in_recipe:
            ig.is_used_in_recipe ?? parentSub?.is_used_in_recipe ?? false,
          is_sold_directly:
            ig.is_sold_directly ?? parentSub?.is_sold_directly ?? false,
          tax_profile_id: ig.tax_profile_id,
          tax_profile_name: ig.tax_profile_name,
          tax_rate: Number(ig.tax_rate ?? 0),
        }));
    };

    const mapSubCategories = (categoryId: string): CategoryNode[] => {
      const parentCat = categories.find((c) => c.id === categoryId);
      return subCategories
        .filter((sub) => sub.product_category_id === categoryId)
        .map((sub) => ({
          id: sub.id,
          code: sub.code,
          name: sub.name,
          description: sub.description,
          type: NODE_TYPE.SUBCATEGORY,
          children: mapItemGroups(sub.id),
          product_category_id: sub.product_category_id,
          is_active: sub.is_active,
          price_deviation_limit: sub.price_deviation_limit,
          qty_deviation_limit: sub.qty_deviation_limit,
          is_used_in_recipe:
            sub.is_used_in_recipe ?? parentCat?.is_used_in_recipe ?? false,
          is_sold_directly:
            sub.is_sold_directly ?? parentCat?.is_sold_directly ?? false,
          tax_profile_id: sub.tax_profile_id,
          tax_profile_name: sub.tax_profile_name,
          tax_rate: Number(sub.tax_rate ?? 0),
        }));
    };

    return categories.map((cat) => ({
      id: cat.id,
      code: cat.code,
      name: cat.name,
      description: cat.description,
      type: NODE_TYPE.CATEGORY,
      children: mapSubCategories(cat.id),
      is_active: cat.is_active,
      price_deviation_limit: cat.price_deviation_limit,
      qty_deviation_limit: cat.qty_deviation_limit,
      is_used_in_recipe: cat.is_used_in_recipe,
      is_sold_directly: cat.is_sold_directly,
      tax_profile_id: cat.tax_profile_id,
      tax_profile_name: cat.tax_profile_name,
      tax_rate: Number(cat.tax_rate ?? 0),
    }));
  }, [categories, subCategories, itemGroups]);

  useEffect(() => {
    if (isLoading) return;
    const tree = buildCategoryTree();
    setCategoryData(tree);

    const initialExpanded: Record<string, boolean> = {};
    for (const cat of tree) {
      initialExpanded[cat.id] = true;
    }
    setExpanded(initialExpanded);
  }, [isLoading, buildCategoryTree]);

  const expandAll = useCallback(() => {
    const all: Record<string, boolean> = {};
    const walk = (nodes: CategoryNode[]) => {
      for (const node of nodes) {
        all[node.id] = true;
        if (node.children?.length) walk(node.children);
      }
    };
    walk(categoryData);
    setExpanded(all);
  }, [categoryData]);

  const collapseAll = useCallback(() => {
    setExpanded({});
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return { categoryData, expanded, expandAll, collapseAll, toggleExpand };
}
