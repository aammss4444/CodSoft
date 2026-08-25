exports.up = pgm => {
  pgm.addColumns('users', {
    username: { type: 'varchar(255)', unique: true }
  });
};

exports.down = pgm => {
  pgm.dropColumns('users', ['username']);
};
