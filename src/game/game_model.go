package game

type GameModel struct {
	Id      string `gorm:"primary_key"`
	GobData []byte
}
