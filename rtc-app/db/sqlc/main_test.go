package db

import (
	"database/sql"
	"log"
	"os"
	"testing"

	"github.com/ihi108/hello-rtc/rtc-app/util"

	_ "github.com/lib/pq"
)

var testQueries *Queries
var testDB *sql.DB

func TestMain(m *testing.M) {
	config, err := util.LoadConfig("../..")
	if err != nil {
		log.Fatal("failed to load config: ", err)
	}
	testDB, err = sql.Open(config.DBDriver, config.DBSource)
	if err != nil {
		log.Fatal("cannot connect to the database: ", err)
	}

	testQueries = New(testDB)

	os.Exit(m.Run())
}
