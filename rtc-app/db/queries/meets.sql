-- name: GetMeet :one
SELECT * FROM meets
WHERE id = $1 LIMIT 1;

-- name: ListMeets :many
SELECT * FROM meets
ORDER BY id;

-- name: CreateMeet :one
INSERT INTO meets (
  id,
  title,
  description,
  recording,
  author
) VALUES (
  $1, $2, $3, $4, $5
)
RETURNING *;