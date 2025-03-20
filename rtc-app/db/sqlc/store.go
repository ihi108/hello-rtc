package db

import "database/sql"

// Store provides functions to execute database queries
type Store struct {
	*Queries
	Key string
}

// NewStore returns a new Store
func NewStore(db *sql.DB, key string) *Store {
	return &Store{
		Queries: New(db),
		Key:     key,
	}
}
