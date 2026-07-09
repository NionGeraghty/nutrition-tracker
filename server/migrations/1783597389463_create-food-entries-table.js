exports.up = (pgm) => {
  pgm.createTable('food_entries', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    food_id: {
      type: 'uuid',
      notNull: true,
      references: 'foods',
      onDelete: 'CASCADE',
    },
    date: { type: 'date', notNull: true },
    grams: { type: 'numeric', notNull: true },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('food_entries');
};