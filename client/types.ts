export interface Food {
  id: string;
  name: string;
  calories_per_100g: string;
  protein_per_100g: string;
  carbs_per_100g: string;
  fat_per_100g: string;
  fibre_per_100g: string;
}

export interface Entry {
  id: string;
  food_id: string;
  date: string;
  grams: string;
  meal_type: string;
  name: string;
  calories_per_100g: string;
  protein_per_100g: string;
  carbs_per_100g: string;
  fat_per_100g: string;
  fibre_per_100g: string;
}

interface MacroValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
}

export interface Summary {
  date: string;
  totals: MacroValues;
  goals: MacroValues | null;
  remaining: MacroValues | null;
}

export interface Goals {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fibre: string;
}