DROP TABLE IF EXISTS city_data;

CREATE TABLE city_data(
  id SERIAL PRIMARY KEY,
  city_name VARCHAR(255),
  lat INT,
  lon INT
)