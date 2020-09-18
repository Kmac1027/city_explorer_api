DROP TABLE IF EXISTS locations;   

CREATE TABLE locations(
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  Formatted_query VARCHAR(255),
  latitude decimal,
  longitude decimal
);

DROP TABLE IF EXISTS weather;

CREATE TABLE weather(
  id SERIAL PRIMARY KEY,
  formatted_query VARCHAR(255),
  weather_data_slice TEXT,
  time_of_day VARCHAR(255)
);

SELECT * FROM locations;