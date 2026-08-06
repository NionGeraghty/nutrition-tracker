exports.up = (pgm) => {
  pgm.addColumn('users', {
    reset_token: { type: 'text', notNull: false },
    reset_token_expires: { type: 'timestamp', notNull: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('users', 'reset_token');
  pgm.dropColumn('users', 'reset_token_expires');
};