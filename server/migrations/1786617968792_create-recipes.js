exports.up = (pgm) => {
  pgm.createTable('recipes', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: { type: 'text', notNull: true },
    total_grams: { type: 'numeric', notNull: true },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('recipe_ingredients', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    recipe_id: {
      type: 'uuid',
      notNull: true,
      references: 'recipes',
      onDelete: 'CASCADE',
    },
    food_id: {
      type: 'uuid',
      notNull: true,
      references: 'foods',
      onDelete: 'CASCADE',
    },
    grams: { type: 'numeric', notNull: true },
  });

  pgm.addColumn('foods', {
    recipe_id: {
      type: 'uuid',
      notNull: false,
      references: 'recipes',
      onDelete: 'SET NULL',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('foods', 'recipe_id');
  pgm.dropTable('recipe_ingredients');
  pgm.dropTable('foods');
};