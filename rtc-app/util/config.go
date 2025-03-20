package util

import (
	"github.com/spf13/viper"
)

// Config stores all configuration of the application.
// The values are read by viper from a config  file or environment varialbes
type Config struct {
	ServerAddress string `mapstructure:"SERVER_ADDRESS"`
	AppAPI        string `mapstructure:"APP_API"`
	DBDriver      string `mapstructure:"DB_DRIVER"`
	DBSource      string `mapstructure:"DB_SOURCE"`
}

// LoadConfig reads configurations from a config file or environment variables.
func LoadConfig(path string) (config Config, err error) {
	viper.SetConfigName("app") // name of config file (without extension)
	viper.SetConfigType("env") // REQUIRED if the config file does not have the extension in the name
	viper.AddConfigPath(path)  // path to look for the config file in

	err = viper.ReadInConfig() // Find and read the config file
	if err != nil {            // Handle errors reading the config file
		return
	}

	viper.AutomaticEnv()
	viper.Unmarshal(&config)
	return
}
