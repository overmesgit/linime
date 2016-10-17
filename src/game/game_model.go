package game

type GameModel struct {
	Id       string `gorm:"primary_key"`
	GameJson string `sql:"type:jsonb"`
}
