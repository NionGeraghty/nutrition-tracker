exports.up = (pgm) => {
  pgm.createTable('suggestion_requests', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('suggestion_requests', ['user_id', 'created_at']);
};

exports.down = (pgm) => {
  pgm.dropTable('suggestion_requests');
};