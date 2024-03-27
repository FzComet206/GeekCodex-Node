ALTER TABLE posts ADD COLUMN search_vector tsvector;
UPDATE posts SET search_vector = to_tsvector('english', title || ' ' || body);
CREATE INDEX search_idx ON posts USING gin(search_vector);

CREATE FUNCTION posts_search_trigger() RETURNS trigger AS $$
begin
  new.search_vector := to_tsvector('english', new.title || ' ' || new.body);
  return new;
end
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
ON posts FOR EACH ROW EXECUTE FUNCTION posts_search_trigger();