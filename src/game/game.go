package game

import (
	"encoding/json"
	"gopkg.in/mgo.v2/bson"
	"mal/parser"
	"math/rand"
	"sort"
)

type GameCharPosition struct {
	GroupId int `bson:"groupid"`
	CharId  int `bson:"charid"`
	Row     int `bson:"row"`
	Col     int `bson:"col"`
}

type Game struct {
	Id     string             `bson:"_id"`
	Field  []GameCharPosition `bson:"field"`
	Height int                `bson:"height"`
	Width  int                `bson:"width"`
}

func (g *Game) AddChar(group, char, row, col int) {
	g.Field = append(g.Field, GameCharPosition{group, char, row, col})
}

func (g *Game) Save() {
	err := mongoDB.C("game").Insert(g)
	if err != nil {
		panic(err)
	}
}

func (g *Game) AsJson() []byte {
	data, err := json.Marshal(g)
	if err != nil {
		panic(err)
	}
	return data
}

func NewGame() *Game {
	return &Game{RandString(8), make([]GameCharPosition, 0), 9, 9}
}

func GetGame(uuid string) (*Game, error) {
	game := NewGame()
	err := mongoDB.C("game").FindId(uuid).One(game)
	if err != nil {
		panic(err)
	}
	return game, err
}

func GetAllPositions(row, col int) [][2]int {
	result := make([][2]int, row*col)
	for i := 0; i < row; i++ {
		for j := 0; j < col; j++ {
			result[i*col+j] = [2]int{i, j}
		}
	}
	return result
}

func CreateNewGame() *Game {
	titlesCount, charCount := 5, 4
	game := NewGame()

	var groupResult []int
	anime := mongoDB.C("anime")
	notNil := bson.M{"$ne": nil}
	anime.Find(bson.M{"characters": notNil}).Distinct("group", &groupResult)

	allPositions := GetAllPositions(game.Width, game.Height)
	randomPositions := rand.Perm(game.Width * game.Height)

	randomIndexes := rand.Perm(len(groupResult))
	for i := 0; i < titlesCount; i++ {
		var characters parser.CharacterSlice
		groupIndex := groupResult[randomIndexes[i]]
		anime.Find(bson.M{"characters": notNil, "group": groupIndex}).Sort("-members_score").Distinct("characters", &characters)
		sort.Sort(sort.Reverse(characters))
		for j := 0; j < charCount; j++ {
			pos := allPositions[randomPositions[i*charCount+j]]
			game.AddChar(groupIndex, characters[j].Id, pos[0], pos[1])
		}
	}

	return game
}
