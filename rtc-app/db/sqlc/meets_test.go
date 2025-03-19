package db

import (
	"context"
	"database/sql"
	"testing"

	"github.com/ihi108/hello-rtc/rtc-app/util"

	"github.com/stretchr/testify/require"
)

func createRandomMeet(t *testing.T, user User) Meet {
	arg := CreateMeetParams{
		ID:          util.RandomString(11),
		Author:      user.Username,
		Title:       sql.NullString{String: util.RandomString(10), Valid: true},
		Description: sql.NullString{String: util.RandomString(20), Valid: true},
	}
	meet, err := testQueries.CreateMeet(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, meet)
	require.NotZero(t, meet.Description)
	require.NotZero(t, meet.Title)

	require.Equal(t, user.Username, meet.Author)

	require.NotZero(t, meet.CreatedAt)
	require.NotZero(t, meet.UpdatedAt)

	return meet
}

func TestCreateMeet(t *testing.T) {
	user := RandomUser(t)

	createRandomMeet(t, user)
}

func TestGetMeet(t *testing.T) {
	user := RandomUser(t)

	meet1 := createRandomMeet(t, user)

	meet2, err := testQueries.GetMeet(context.Background(), meet1.ID)
	require.NoError(t, err)
	require.NotEmpty(t, meet2)
}
