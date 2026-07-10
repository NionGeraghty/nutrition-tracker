exports.up = (pgm) => {
  pgm.alterColumn('foods', 'user_id', { notNull: true });
  pgm.alterColumn('food_entries', 'user_id', { notNull: true });
};

exports.down = (pgm) => {
  pgm.alterColumn('foods', 'user_id', { notNull: false });
  pgm.alterColumn('food_entries', 'user_id', { notNull: false });
};