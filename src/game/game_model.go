package game

import "time"

type GameModel struct {
	Id         string `gorm:"primary_key"`
	GameJson   string `sql:"type:jsonb"`
	UserName   string
	Score      int `gorm:"index"`
	EndDate    time.Time
	Date       time.Time
	Difficulty int `gorm:"index"`
}
