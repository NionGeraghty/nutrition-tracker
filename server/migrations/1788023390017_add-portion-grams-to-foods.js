exports.up = (pgm) => {
  pgm.addColumn('foods', {
    portion_grams: { type: 'numeric', notNull: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('foods', 'portion_grams');
};