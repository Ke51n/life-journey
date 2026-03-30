package models

import (
	"life-journal/config"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `gorm:"unique;not null" json:"username"`
	Password string `gorm:"not null" json:"-"`
}

type Profile struct {
	gorm.Model
	UserID uint   `json:"user_id"`
	Name   string `json:"name"`
	Height int    `json:"height"`
	Weight int    `json:"weight"`
	Zodiac string `json:"zodiac"`
	MBTI   string `json:"mbti"`
	Photo  string `json:"photo"`
}

type Person struct {
	gorm.Model
	UserID uint   `json:"user_id"`
	Name   string `json:"name"`
	Type   string `json:"type"`
}

type Relationship struct {
	gorm.Model
	UserID   uint   `json:"user_id"`
	SourceID uint   `json:"source_id"`
	TargetID uint   `json:"target_id"`
	Type     string `json:"type"`
}

type Record struct {
	gorm.Model
	UserID    uint   `json:"user_id"`
	Category  string `json:"category"`
	Title     string `json:"title"`
	Date      string `json:"date"`
	Tags      string `json:"tags"`     // JSON array string
	Content   string `json:"content"`
	Image     string `json:"image"`
	Video     string `json:"video"`
	Locations string `json:"locations"` // JSON array string
	Itinerary string `json:"itinerary"` // JSON array string
}

type Log struct {
	gorm.Model
	UserID uint   `json:"user_id"`
	Entity string `json:"entity"`
	Action string `json:"action"`
	Before string `json:"before"` // JSON string
	After  string `json:"after"`  // JSON string
}

var DB *gorm.DB

func InitDB(cfg *config.Config) error {
	var err error
	var dialector gorm.Dialector

	if cfg.DatabaseType == "postgres" {
		dialector = postgres.Open(cfg.DatabaseURL)
	} else {
		dialector = sqlite.Open("life_journal.db")
	}

	DB, err = gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		return err
	}

	// Auto migrate
	return DB.AutoMigrate(&User{}, &Profile{}, &Person{}, &Relationship{}, &Record{}, &Log{})
}
