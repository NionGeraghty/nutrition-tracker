exports.up = (pgm) => {
  pgm.addColumn('users', {
    password_hash: { type: 'text', notNull: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('users', 'password_hash');
};