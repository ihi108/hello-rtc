package main

import (
	"database/sql"
	"log"

	db "github.com/ihi108/hello-rtc/rtc-app/db/sqlc"
	"github.com/ihi108/hello-rtc/rtc-app/server"
	"github.com/ihi108/hello-rtc/rtc-app/util"

	_ "github.com/lib/pq"
)

func main() {
	config, err := util.LoadConfig(".")
	if err != nil {
		log.Fatal("Failed to load configurations: ", err)
	}
	conn, err := sql.Open(config.DBDriver, config.DBSource)
	if err != nil {
		log.Fatal("cannot connect to the database: ", err)
	}

	store := db.NewStore(conn, config.AppAPI)
	server := server.NewServer(*store)

	err = server.Start(config.ServerAddress)

	if err != nil {
		log.Fatal("cannot start server: ", err)
	}
}
