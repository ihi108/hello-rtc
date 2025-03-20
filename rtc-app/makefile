startcontainer:
	docker start postgres17
stopcontainer:
	docker stop postgres17
createdb:
	docker exec -it postgres17 createdb -O root -U root hellortc
dropdb:
	docker exec -it postgres17 dropdb hellortc
create_migrations:
	migrate create -ext sql -dir db/migrations -seq init_schema
migrateup:
	migrate -database postgres://root:password@localhost:5432/hellortc?sslmode=disable -path db/migrations up
migratedown:
	migrate -database postgres://root:password@localhost:5432/hellortc?sslmode=disable -path db/migrations down -all
sqlc:
	sqlc generate
test:
	go test -v -cover ./...
opendb:
	docker exec -it postgres17 psql -U root hellortc
server:
	go run main.go
.PHONY: startcontainer stopcontainer createdb dropdb create_migrations migrateup migratedown sqlc test opendb server