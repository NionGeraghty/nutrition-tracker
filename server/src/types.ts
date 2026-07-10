export interface Food {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fibrePer100g: number;
  userId: string;
}

export interface FoodEntry {
  id: string;
  foodId: string;
  date: string;
  grams: number;
  userId: string;
}

export interface User {
  id: string;
  email: string;
}