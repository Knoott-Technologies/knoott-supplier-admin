"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  children?: Category[];
}

interface CategoryTreeSelectProps {
  categories: Category[];
  selectedCategory: string;
  onSelect: (categoryId: string) => void;
  isLoading?: boolean;
}

export function CategoryTreeSelect({
  categories,
  selectedCategory,
  onSelect,
  isLoading = false,
}: CategoryTreeSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    {}
  );
  const [processedCategories, setProcessedCategories] = useState<Category[]>(
    []
  );

  // Process categories into a tree structure
  useEffect(() => {
    if (!categories.length) return;

    // Create a map for quick lookup
    const categoryMap: Record<string, Category> = {};
    categories.forEach((category) => {
      categoryMap[category.id] = { ...category, children: [] };
    });

    // Build the tree
    const rootCategories: Category[] = [];
    categories.forEach((category) => {
      if (category.parent_id && categoryMap[category.parent_id]) {
        if (!categoryMap[category.parent_id].children) {
          categoryMap[category.parent_id].children = [];
        }
        categoryMap[category.parent_id].children!.push(
          categoryMap[category.id]
        );
      } else if (!category.parent_id) {
        rootCategories.push(categoryMap[category.id]);
      }
    });

    setProcessedCategories(rootCategories);

    // Auto-expand nodes that contain the selected category
    if (selectedCategory) {
      const newExpandedNodes: Record<string, boolean> = {};
      let currentCategory = categories.find((c) => c.id === selectedCategory);

      while (currentCategory?.parent_id) {
        newExpandedNodes[currentCategory.parent_id] = true;
        currentCategory = categories.find(
          (c) => c.id === currentCategory?.parent_id
        );
      }

      setExpandedNodes(newExpandedNodes);
    }
  }, [categories, selectedCategory]);

  // Toggle node expansion
  const toggleNode = (categoryId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Filter categories based on search term
  const filterCategories = (
    categories: Category[],
    searchTerm: string
  ): Category[] => {
    if (!searchTerm) return categories;

    const lowerSearchTerm = searchTerm.toLowerCase();

    return categories
      .map((category) => {
        // Check if this category matches
        const matches = category.name.toLowerCase().includes(lowerSearchTerm);

        // Check if any children match
        const filteredChildren = category.children
          ? filterCategories(category.children, searchTerm)
          : [];

        // Include this category if it matches or has matching children
        if (matches || filteredChildren.length > 0) {
          return {
            ...category,
            children: filteredChildren ?? [],
          } as Category;
        }

        return null;
      })
      .filter((category): category is Category => category !== null);
  };

  const filteredCategories = filterCategories(processedCategories, searchTerm);

  // Render a category node and its children recursively
  const renderCategoryNode = (category: Category, level = 0) => {
    const isExpanded = expandedNodes[category.id];
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id} className="w-full">
        <div className="flex items-center w-full">
          <div className="w-6 flex justify-center">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleNode(category.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-6" />
            )}
          </div>
          <Button
            variant="ghost"
            className={cn(
              "justify-start px-2 py-1 h-8 text-sm w-full",
              selectedCategory === category.id && "bg-contrast/20 font-medium text-contrast"
            )}
            onClick={() => onSelect(category.id)}
            style={{ paddingLeft: `${level * 8 + 8}px` }}
          >
            {category.name}
          </Button>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-6">
            {category.children!.map((child) =>
              renderCategoryNode(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 bg-sidebar"
        />
      </div>

      <ScrollArea className="max-h-[300px] bg-sidebar border overflow-scroll">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="p-2">
            {filteredCategories.map((category) => renderCategoryNode(category))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No se encontraron categorías
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
