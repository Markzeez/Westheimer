import React, { useState } from "react";
import { ChevronDown, Grid, List } from "lucide-react"; // lucide-react installed

const colorFilters = [
  { name: "Blue", value: "blue", color: "bg-blue-500" },
  { name: "Grey", value: "grey", color: "bg-gray-500" },
  { name: "Pink", value: "pink", color: "bg-pink-500" },
  { name: "Yellow", value: "yellow", color: "bg-yellow-500" },
] as const;

// Strongly typed filter options
type Category = "" | "shirts" | "hoodies" | "jackets" | "coats";
type Color = "" | "blue" | "grey" | "pink" | "yellow";
type Size = "" | "xs" | "s" | "m" | "l" | "xl";
type Brand = "" | "guza";
type Price = "" | "0-25" | "25-50" | "50-100";

interface Filters {
  category: Category;
  color: Color;
  size: Size;
  brand: Brand;
  price: Price;
}

type ViewMode = "grid" | "list";

interface FilterSectionProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  setFilters,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
}) => {
  const [showColorFilter, setShowColorFilter] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Filters */}
          <div className="flex items-center space-x-6">
            <span className="text-sm text-gray-600">Filter by:</span>

            {/* Categories Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value as Category })
                }
              >
                <option value="">Categories</option>
                <option value="shirts">Shirts</option>
                <option value="hoodies">Hoodies</option>
                <option value="jackets">Jackets</option>
                <option value="coats">Coats</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Color Filter */}
            <div className="relative">
              <button
                className="flex items-center bg-white border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                onClick={() => setShowColorFilter(!showColorFilter)}
              >
                Color
                <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
              </button>

              {showColorFilter && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 min-w-48">
                  <h3 className="font-medium text-sm mb-3">Colors</h3>
                  <div className="space-y-2">
                    {colorFilters.map((color) => (
                      <label
                        key={color.value}
                        className="flex items-center cursor-pointer"
                      >
                        <div
                          className={`w-4 h-4 rounded-full ${color.color} mr-2`}
                        />
                        <input
                          type="radio"
                          name="color"
                          value={color.value}
                          checked={filters.color === color.value}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              color: e.target.value as Color,
                            })
                          }
                          className="hidden"
                        />
                        <span className="text-sm text-gray-700">
                          {color.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Size Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={filters.size}
                onChange={(e) =>
                  setFilters({ ...filters, size: e.target.value as Size })
                }
              >
                <option value="">Size</option>
                <option value="xs">XS</option>
                <option value="s">S</option>
                <option value="m">M</option>
                <option value="l">L</option>
                <option value="xl">XL</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Brand Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={filters.brand}
                onChange={(e) =>
                  setFilters({ ...filters, brand: e.target.value as Brand })
                }
              >
                <option value="">Brand</option>
                <option value="guza">Guza</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Price Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={filters.price}
                onChange={(e) =>
                  setFilters({ ...filters, price: e.target.value as Price })
                }
              >
                <option value="">Price</option>
                <option value="0-25">$0 - $25</option>
                <option value="25-50">$25 - $50</option>
                <option value="50-100">$50 - $100</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Sort and View */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default Sorting</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded">
              <button
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-black text-white"
                    : "bg-white text-gray-600"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-black text-white"
                    : "bg-white text-gray-600"
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
