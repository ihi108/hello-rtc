package db

import (
	"context"
	"testing"

	"github.com/ihi108/hello-rtc/rtc-app/util"

	"github.com/stretchr/testify/require"
)

func TestCreateUser(t *testing.T) {
	arg := CreateUserParams{
		Username:       util.RandomName(7),
		FirstName:      util.RandomName(8),
		LastName:       util.RandomName(6),
		Email:          util.RandomEmail(),
		HashedPassword: "secret",
		DateOfBirth:    util.RandomBirthDay(),
	}

	user, err := testQueries.CreateUser(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, user)
	require.Equal(t, arg.Username, user.Username)
	require.Equal(t, arg.FirstName, user.FirstName)
	require.Equal(t, arg.LastName, user.LastName)
	require.Equal(t, arg.Email, user.Email)
	require.Equal(t, arg.DateOfBirth.Year(), user.DateOfBirth.Year())
	require.Equal(t, arg.DateOfBirth.Month(), user.DateOfBirth.Month())
	require.Equal(t, arg.DateOfBirth.Day(), user.DateOfBirth.Day())

	require.NotZero(t, user.ID)
	require.NotZero(t, user.CreatedAt)
	require.NotZero(t, user.UpdatedAt)
}
