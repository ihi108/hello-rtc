package util

import (
	"testing"

	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

func TestGeneratePasswordHash(t *testing.T) {
	password := RandomString(8)

	hashedPassword, err := GeneratePasswordHash(password)
	require.NoError(t, err)
	require.NotEmpty(t, hashedPassword)

	err = CheckPassword(password, hashedPassword)
	require.NoError(t, err)

	wrongPassword := RandomString(8)
	err = CheckPassword(wrongPassword, hashedPassword)
	require.Equal(t, err, bcrypt.ErrMismatchedHashAndPassword)

	newPasswordHash, err := GeneratePasswordHash(password)
	require.NoError(t, err)
	require.NotEmpty(t, newPasswordHash)

	require.NotEqual(t, hashedPassword, newPasswordHash)

}
