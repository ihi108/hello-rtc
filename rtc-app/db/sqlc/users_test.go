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
}
