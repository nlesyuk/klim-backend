create TABLE general(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  data VARCHAR(255)
);

create TABLE work(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  videos JSON,
  credits TEXT,
  work_order INTEGER,
  description TEXT,
  category TEXT[],
  photos INTEGER[]
);

create TABLE shot(
  id SERIAL PRIMARY KEY,
  categories TEXT[],
  photos INTEGER[]
);

create TABLE photo(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  category TEXT[],
  photos INTEGER[]
);

create TABLE photos(
  id SERIAL PRIMARY KEY,
  work_id INTEGER,
  shot_id INTEGER,
  photo_id INTEGER,
  work_order INTEGER,
  shot_order INTEGER,
  photo_order INTEGER,
  is_preview BOOLEAN,
  format VARCHAR(255),
  categories VARCHAR(255),
  image VARCHAR(255)
);








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