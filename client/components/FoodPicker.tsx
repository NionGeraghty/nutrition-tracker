'use client';

import { useState, useRef, useEffect } from 'react';

interface PickerFood {
  id: string;
  name: string;
}

export default function FoodPicker({
  foods,
  value,
  onChange,
  placeholder,
}: {
  foods: PickerFood[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedFood = foods.find((f) => f.id === value);

  useEffect(() => {
    setQuery(selectedFood ? selectedFood.name : '');
  }, [value, selectedFood]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery(selectedFood ? selectedFood.name : '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedFood]);

  const filtered = query
    ? foods.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
    : foods;

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          if (e.target.value === '') {
            onChange('');
          }
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="border p-2 rounded w-full"
      />
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded w-full max-h-48 overflow-y-auto mt-1 shadow-sm">
          {filtered.map((food) => (
            <li key={food.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(food.id);
                  setQuery(food.name);
                  setIsOpen(false);
                }}
                className="w-full text-left p-2 text-sm hover:bg-primary-light transition"
              >
                {food.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}