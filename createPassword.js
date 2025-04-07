const bcrypt = require('bcryptjs');

const username = 'user';
const password = '1234567890';
console.log([username, bcrypt.hashSync(password, 8)]);

/*
HOW TO CREATE USER IN DB?

 INSERT INTO users(username, password) VALUES ('user', '$ajsdnhaksd18219823') RETURNING *;
*/
