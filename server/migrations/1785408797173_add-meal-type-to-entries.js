exports.up = (pgm) => {
  pgm.addColumn('food_entries', {
    meal_type: {
      type: 'text',
      notNull: true,
      default: 'other',
      check: "meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('food_entries', 'meal_type');
};