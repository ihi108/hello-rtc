package util

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestRandom(t *testing.T) {
	name := RandomName(8)
	require.NotEmpty(t, name)

	email := RandomEmail()
	require.NotEmpty(t, email)

	birthDaty := RandomBirthDay()
	require.NotEmpty(t, birthDaty)

}
