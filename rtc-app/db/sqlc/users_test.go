package db

import (
	"context"
	"testing"
	"time"

	"github.com/ihi108/hello-rtc/rtc-app/util"

	"github.com/stretchr/testify/require"
)

func RandomUser(t *testing.T) User {
	password := util.RandomString(8)
	hashedPassword, err := util.GeneratePasswordHash(password)
	require.NoError(t, err)
	arg := CreateUserParams{
		Username:       util.RandomName(7),
		FirstName:      util.RandomName(8),
		LastName:       util.RandomName(6),
		Email:          util.RandomEmail(),
		HashedPassword: hashedPassword,
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

	require.NoError(t, util.CheckPassword(password, hashedPassword))

	require.NotZero(t, user.ID)
	require.NotZero(t, user.CreatedAt)
	require.NotZero(t, user.UpdatedAt)

	return user
}

func TestCreateUser(t *testing.T) {
	RandomUser(t)
}

func TestGetUser(t *testing.T) {
	user1 := RandomUser(t)

	user2, err := testQueries.GetUser(context.Background(), user1.Username)
	require.NoError(t, err)
	require.NotEmpty(t, user2)

	require.Equal(t, user1.Username, user2.Username)
	require.Equal(t, user1.FirstName, user2.FirstName)
	require.Equal(t, user1.LastName, user2.LastName)
	require.Equal(t, user1.ID, user2.ID)
	require.Equal(t, user1.Email, user2.Email)
	require.Equal(t, user1.DateOfBirth.Year(), user2.DateOfBirth.Year())
	require.Equal(t, user1.DateOfBirth.Month(), user2.DateOfBirth.Month())
	require.Equal(t, user1.DateOfBirth.Day(), user2.DateOfBirth.Day())
	require.Equal(t, user1.Username, user2.Username)

	require.WithinDuration(t, user1.CreatedAt, user2.CreatedAt, time.Second)
	require.WithinDuration(t, user1.UpdatedAt, user2.UpdatedAt, time.Second)
	require.WithinDuration(t, user1.PasswordChangedAt, user2.PasswordChangedAt, time.Second)
}

func TestListUsers(t *testing.T) {
	for i := 0; i < 5; i++ {
		RandomUser(t)
	}

	users, err := testQueries.ListUsers(context.Background())
	require.NoError(t, err)

	for _, user := range users {
		require.NotEmpty(t, user)
	}
}
