"use client";

import React, { useState } from "react";

interface CategoryTabsProps {
  categories?: string[];
  defaultActive?: string;
  onCategoryChange?: (category: string) => void;
}

const CategoryTabs = ({
  categories = [
    "Moodboard",
    "Living",
    "Textiles",
    "Ceramic",
    "Furniture",
    "Decor",
  ],
  defaultActive = "Moodboard",
  onCategoryChange,
}: CategoryTabsProps) => {
  const [activeCategory, setActiveCategory] = useState(defaultActive);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  return (
    <div className="sticky top-[56px] sm:top-[60px] z-40 border-b border-gray-100 bg-white">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center space-x-3 sm:space-x-4 px-4 sm:px-6 py-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`
                px-3 sm:px-4 py-1.5 sm:py-2 
                rounded-full 
                text-xs sm:text-sm 
                font-medium 
                transition-all duration-200
                whitespace-nowrap
                min-w-fit
                active:scale-95
                ${
                  activeCategory === category
                    ? "bg-indigo-500 text-white shadow-md"
                    : "bg-violet-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;
