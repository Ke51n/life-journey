package config

import (
	"os"
)

type Config struct {
	Port         string
	JWTSecret    string
	DatabaseURL  string
	DatabaseType string // "sqlite" or "postgres"
}

func Load() *Config {
	dbURL := os.Getenv("DATABASE_URL")
	dbType := "sqlite"
	if dbURL != "" {
		dbType = "postgres"
	}

	return &Config{
		Port:         getEnv("PORT", "8080"),
		JWTSecret:    getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		DatabaseURL:  dbURL,
		DatabaseType: dbType,
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
