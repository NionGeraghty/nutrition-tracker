exports.up = (pgm) => {
  pgm.createTable('foods', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: { type: 'text', notNull: true },
    calories_per_100g: { type: 'numeric', notNull: true },
    protein_per_100g: { type: 'numeric', notNull: true },
    carbs_per_100g: { type: 'numeric', notNull: true },
    fat_per_100g: { type: 'numeric', notNull: true },
    fibre_per_100g: { type: 'numeric', notNull: true },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('foods');
};