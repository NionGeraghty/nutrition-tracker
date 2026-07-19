exports.up = (pgm) => {
  pgm.createTable('daily_goals', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      unique: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    calories: { type: 'numeric', notNull: true },
    protein: { type: 'numeric', notNull: true },
    carbs: { type: 'numeric', notNull: true },
    fat: { type: 'numeric', notNull: true },
    fibre: { type: 'numeric', notNull: true },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('daily_goals');
};