package util

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestLoadConfig(t *testing.T) {
	config, err := LoadConfig("../")
	require.NoError(t, err)
	require.NotEmpty(t, config)
	require.NotEmpty(t, config.AppAPI)
	require.NotEmpty(t, config.DBDriver)
	require.NotEmpty(t, config.DBSource)
	require.NotEmpty(t, config.ServerAddress)
}
