-- ok
create TABLE general(
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  name VARCHAR(255),
  data TEXT
);


-- ok
create TABLE work(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  videos JSON,
  credits TEXT,
  work_order INTEGER,
  description TEXT,
  category TEXT[],
  photos INTEGER[]
  user_id INTEGER
);


-- ok
create TABLE shot(
  id SERIAL PRIMARY KEY,
  categories TEXT[],
  work_id INTEGER,
  user_id INTEGER
);


-- ok
create TABLE photo(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description VARCHAR,
  credits VARCHAR,
  photo_order INTEGER,
  categories TEXT[]
  user_id INTEGER
);


-- ok
create TABLE photos(
  id SERIAL PRIMARY KEY,

  work_id INTEGER,
  work_order INTEGER,
  is_work_preview BOOLEAN,
  work_categories VARCHAR(255),

  photo_id INTEGER,
  photo_order INTEGER,
  is_photo_preview BOOLEAN,
  photo_categories VARCHAR(255),

  shot_id INTEGER,
  shot_order INTEGER,

  format VARCHAR(255),
  image VARCHAR(255)
  user_id INTEGER
);


-- ok
create TABLE slides(
  id SERIAL PRIMARY KEY,
  type VARCHAR(255),
  title VARCHAR(255),
  slide_order INTEGER,
  image VARCHAR(255) DEFAULT NULL,
  videos VARCHAR(255) DEFAULT NULL,
  work_id INTEGER DEFAULT NULL,
  photo_id INTEGER DEFAULT NULL
  user_id INTEGER
);


-- it schame allow only 1 session for 1 user, for muliply sessions you shuold use separated table for JWT token
create TABLE users(
  id SERIAL PRIMARY KEY,
  username VARCHAR(255),
  password VARCHAR(255),
  refresh_token VARCHAR(255),
  expiry_date VARCHAR(255)
);


-- JWT refresh token table
-- create TABLE refreshToken(
--   user_id Numeric,
--   refresh_token VARCHAR(255),
--   expiry_date VARCHAR(255)
-- );

-- create TABLE person(
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255),
--   surname VARCHAR(255)
-- );

-- create TABLE post(
--   id SERIAL PRIMARY KEY,
--   title VARCHAR(255),
--   content VARCHAR(255),
--   user_id INTEGER,
--   FOREIGN KEY (user_id) REFERENCES person (id)
-- );



-- ALTER TABLE photos ADD COLUMN user_id INTEGER;