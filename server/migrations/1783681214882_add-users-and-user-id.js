exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    email: { type: 'text', notNull: true, unique: true },
  });

  pgm.addColumn('foods', {
    user_id: {
      type: 'uuid',
      references: 'users',
      onDelete: 'CASCADE',
    },
  });

  pgm.addColumn('food_entries', {
    user_id: {
      type: 'uuid',
      references: 'users',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('food_entries', 'user_id');
  pgm.dropColumn('foods', 'user_id');
  pgm.dropTable('users');
};