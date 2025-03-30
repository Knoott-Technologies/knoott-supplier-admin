"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Check,
  ChevronsUpDown,
  Search,
  X,
  ChevronRight,
  ArrowLeft,
  Folder,
  FolderOpen,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import type { Database } from "@/database.types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

type Category = Database["public"]["Tables"]["catalog_collections"]["Row"];

interface HierarchicalCategorySelectorProps {
  label: string;
  categories: Category[];
  value: number | null | undefined;
  onChange: (value: number) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  sheetTitle: string;
  sheetDescription: string;
}

// Interface for hierarchical tree structure
interface CategoryNode {
  category: Category;
  children: CategoryNode[];
  isMatch: boolean;
}

export default function HierarchicalCategorySelector({
  label,
  categories,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  sheetTitle,
  sheetDescription,
}: HierarchicalCategorySelectorProps) {
  const [openSheet, setOpenSheet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [navigationPath, setNavigationPath] = useState<Category[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Build a complete category tree
  const categoryTree = useMemo(() => {
    // First, create a map of all categories by ID
    const categoryMap = new Map<number, CategoryNode>();

    // Initialize all categories as nodes
    categories.forEach((category) => {
      categoryMap.set(category.id, {
        category,
        children: [],
        isMatch: false,
      });
    });

    // Build the tree structure by connecting parents and children
    const rootNodes: CategoryNode[] = [];

    categories.forEach((category) => {
      const node = categoryMap.get(category.id);
      if (!node) return;

      if (category.parent_id === null) {
        // This is a root node
        rootNodes.push(node);
      } else {
        // This is a child node
        const parentNode = categoryMap.get(category.parent_id);
        if (parentNode) {
          parentNode.children.push(node);
        }
      }
    });

    // Sort children by name
    const sortNodeChildren = (node: CategoryNode) => {
      node.children.sort((a, b) =>
        a.category.name.localeCompare(b.category.name)
      );
      node.children.forEach(sortNodeChildren);
    };

    rootNodes.forEach(sortNodeChildren);

    return rootNodes;
  }, [categories]);

  // Filter the category tree based on search term
  const filteredCategoryTree = useMemo(() => {
    if (!searchTerm) return categoryTree;

    // Clone the tree and mark matching nodes
    const cloneTree = (nodes: CategoryNode[]): CategoryNode[] => {
      return nodes
        .map((node) => {
          // Check if this node matches the search term
          const isMatch = node.category.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

          // Process children
          let clonedChildren: CategoryNode[] = [];
          if (node.children.length > 0) {
            // Always include all children if parent matches
            if (isMatch) {
              clonedChildren = node.children.map((child) => ({
                ...child,
                isMatch: true,
                children: cloneTree(child.children),
              }));
            } else {
              // Otherwise, recursively filter children
              clonedChildren = cloneTree(node.children);
            }
          }

          // Check if any children match
          const hasMatchingChild = clonedChildren.length > 0;

          return {
            category: node.category,
            children: clonedChildren,
            isMatch: isMatch || hasMatchingChild,
          };
        })
        .filter((node) => node.isMatch);
    };

    return cloneTree(categoryTree);
  }, [categoryTree, searchTerm]);

  // Organize categories into a hierarchical structure for normal navigation
  const organizeCategories = () => {
    // If searching, we'll use filteredCategoryTree instead
    if (searchTerm) {
      return [];
    }

    // Otherwise, show only categories at the current level
    return categories.filter(
      (category) => category.parent_id === currentParentId
    );
  };

  // Get current categories to display
  const currentCategories = organizeCategories();

  // Detect if it's a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Reset navigation when sheet is closed
  useEffect(() => {
    if (!openSheet) {
      setCurrentParentId(null);
      setNavigationPath([]);
      setSearchTerm("");
      setIsSearching(false);
      setExpandedNodes(new Set());
    }
  }, [openSheet]);

  // Update navigation path when parent changes
  useEffect(() => {
    if (currentParentId === null) {
      setNavigationPath([]);
      return;
    }

    const buildPath = (id: number | null): Category[] => {
      if (id === null) return [];

      const category = categories.find((cat) => cat.id === id);
      if (!category) return [];

      return [...buildPath(category.parent_id), category];
    };

    setNavigationPath(buildPath(currentParentId));
  }, [currentParentId, categories]);

  // Handle search input
  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      // Auto-expand all nodes when searching
      const newExpandedNodes = new Set<number>();
      const addAllNodes = (nodes: CategoryNode[]) => {
        nodes.forEach((node) => {
          if (node.isMatch) {
            newExpandedNodes.add(node.category.id);
            addAllNodes(node.children);
          }
        });
      };
      addAllNodes(filteredCategoryTree);
      setExpandedNodes(newExpandedNodes);
    } else {
      setIsSearching(false);
      setExpandedNodes(new Set());
    }
  }, [searchTerm, filteredCategoryTree]);

  // Navigate to a category
  const navigateToCategory = (category: Category) => {
    setCurrentParentId(category.id);
  };

  // Navigate to root
  const navigateToRoot = () => {
    setCurrentParentId(null);
    setNavigationPath([]);
  };

  // Navigate to specific level in the path
  const navigateToPathIndex = (index: number) => {
    if (index < 0) {
      // Navigate to root
      navigateToRoot();
    } else if (index < navigationPath.length) {
      // Navigate to the category at the specified index
      setCurrentParentId(navigationPath[index].id);
    }
  };

  // Toggle node expansion in search results
  const toggleNodeExpansion = (categoryId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    const newExpandedNodes = new Set(expandedNodes);
    if (expandedNodes.has(categoryId)) {
      newExpandedNodes.delete(categoryId);
    } else {
      newExpandedNodes.add(categoryId);
    }
    setExpandedNodes(newExpandedNodes);
  };

  // Select a category
  const selectCategory = (category: Category) => {
    // Only allow selection of level 2 categories
    if (category.level === 2) {
      onChange(category.id);
      setOpenSheet(false);
    } else if (hasChildren(category.id)) {
      // If it has children, navigate to it instead of selecting
      if (isSearching) {
        toggleNodeExpansion(category.id);
      } else {
        navigateToCategory(category);
      }
    }
  };

  // Check if a category has children
  const hasChildren = (categoryId: number) => {
    return categories.some((cat) => cat.parent_id === categoryId);
  };

  // Get the selected category
  const selectedCategory = categories.find((cat) => cat.id === value);

  // Get the full path of the selected category
  const getSelectedPath = (): string => {
    if (!selectedCategory) return placeholder;

    const buildPath = (id: number | null): Category[] => {
      if (id === null) return [];

      const category = categories.find((cat) => cat.id === id);
      if (!category) return [];

      return [...buildPath(category.parent_id), category];
    };

    const path = buildPath(selectedCategory.id);
    return path.map((cat) => cat.name).join(" / ");
  };

  // Check if a category is selectable (level 2)
  const isSelectable = (category: Category) => {
    return category.level === 2;
  };

  // Render a category node in the search results
  const renderCategoryNode = (node: CategoryNode, depth = 0) => {
    const { category, children } = node;
    const hasSubcategories = children.length > 0;
    const isSelected = value === category.id;
    const canSelect = isSelectable(category);
    const isExpanded = expandedNodes.has(category.id);

    return (
      <div key={category.id} className="flex flex-col gap-y-1">
        <div className="flex items-center">
          <Button
            variant={isSelected ? "secondary" : "ghost"}
            size={"sm"}
            className={cn(
              "flex items-center justify-between w-full text-muted-foreground",
              isSelected && "font-medium",
              !canSelect && hasSubcategories && "hover:bg-muted",
              "ml-" + (depth * 4 + 2)
            )}
            onClick={() => selectCategory(category)}
          >
            <span className="flex gap-2 items-center">
              {hasSubcategories ? (
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Folder className="h-4 w-4 text-muted-foreground" />
              )}
              {category.name}
            </span>
            {canSelect && isSelected ? (
              <Check className="h-4 w-4" />
            ) : hasSubcategories ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
                onClick={(e) => toggleNodeExpansion(category.id, e)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <ChevronRight />
            )}
          </Button>
        </div>

        {/* Render children if expanded */}
        {isExpanded && hasSubcategories && (
          <div className="ml-4">
            {children.map((childNode) =>
              renderCategoryNode(childNode, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between",
                !value && "text-muted-foreground"
              )}
            >
              <span className="truncate text-left">{getSelectedPath()}</span>
              <ChevronsUpDown className="h-4 w-4 shrink-0" />
            </Button>
          </FormControl>
        </SheetTrigger>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={cn("p-0 bg-background", isMobile && "h-[80%] max-h-[80%]")}
        >
          <div className="flex h-full w-full flex-col">
            <SheetHeader
              className={cn(
                "text-start p-3 border-b bg-sidebar flex flex-col gap-y-4 space-y-0",
                isSearching || (navigationPath.length > 0 && "border-b-0")
              )}
            >
              <span className="w-full">
                <SheetTitle>{sheetTitle}</SheetTitle>
                <SheetDescription>{sheetDescription}</SheetDescription>
              </span>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder={searchPlaceholder}
                  className="pl-8 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <X
                    className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                )}
              </div>
            </SheetHeader>

            {/* Navigation breadcrumbs */}
            {!isSearching && navigationPath.length > 0 && (
              <div className="p-3 border-b flex items-center gap-2 bg-sidebar">
                <Breadcrumb>
                  <BreadcrumbList>
                    {/* Root/Home link */}
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        className="cursor-pointer flex items-center gap-x-1"
                        onClick={navigateToRoot}
                      >
                        <ArrowLeft className="size-3.5" /> Inicio
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />

                    {/* Path items */}
                    {navigationPath.map((category, index) => (
                      <React.Fragment key={category.id}>
                        <BreadcrumbItem>
                          {index === navigationPath.length - 1 ? (
                            // Current category (last in path)
                            <BreadcrumbLink className="font-medium">
                              {category.name}
                            </BreadcrumbLink>
                          ) : (
                            // Parent category (clickable)
                            <BreadcrumbLink
                              className="cursor-pointer"
                              onClick={() => navigateToPathIndex(index)}
                            >
                              {category.name}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {index < navigationPath.length - 1 && (
                          <BreadcrumbSeparator />
                        )}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            )}

            {/* Back button when searching */}
            {isSearching && (
              <div className="p-2 border-b flex items-center gap-2 bg-sidebar">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="h-8"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver a categorías
                </Button>
              </div>
            )}

            <div className="p-3 bg-background flex min-h-0 flex-1 flex-col gap-1 overflow-auto">
              {/* Regular navigation view */}
              {!isSearching && (
                <>
                  {currentCategories.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      {emptyMessage}
                    </div>
                  ) : (
                    currentCategories.map((category) => {
                      const hasSubcategories = hasChildren(category.id);
                      const isSelected = value === category.id;
                      const canSelect = isSelectable(category);

                      return (
                        <div key={category.id} className="flex items-center">
                          <Button
                            variant={isSelected ? "secondary" : "ghost"}
                            className={cn(
                              "flex items-center justify-between w-full text-muted-foreground",
                              isSelected && "font-medium",
                              !canSelect && hasSubcategories && "hover:bg-muted"
                            )}
                            onClick={() => selectCategory(category)}
                          >
                            <span className="flex items-center">
                              {hasSubcategories ? (
                                <FolderOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                              ) : (
                                <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                              )}
                              {category.name}
                            </span>
                            {(canSelect && isSelected && (
                              <Check className="h-4 w-4" />
                            )) ||
                              (hasSubcategories && (
                                <ChevronRight className="h-4 w-4" />
                              ))}
                          </Button>
                        </div>
                      );
                    })
                  )}
                </>
              )}

              {/* Hierarchical search results */}
              {isSearching && (
                <>
                  {filteredCategoryTree.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      {emptyMessage}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-y-2 w-full">
                      {filteredCategoryTree.map((node) =>
                        renderCategoryNode(node)
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <FormMessage />
    </FormItem>
  );
}
