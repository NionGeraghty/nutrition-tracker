exports.up = (pgm) => {
  pgm.createTable('editor_permissions', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    owner_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    editor_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('editor_permissions', 'unique_owner_editor', {
    unique: ['owner_id', 'editor_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('editor_permissions');
};