package game

import (
	"encoding/json"
	"github.com/syndtr/goleveldb/leveldb/errors"
	"gopkg.in/mgo.v2/bson"
	"mal/parser"
	"math/rand"
)

type GameCharPosition struct {
	TitleId int    `bson:"titleid" json:"-"`
	Id      int    `bson:"id" json:"-"`
	Img     string `bson:"img"`
	Row     int    `bson:"row"`
	Col     int    `bson:"col"`
}

type Game struct {
	Id               string             `bson:"_id"`
	Field            []GameCharPosition `bson:"field"`
	Height           int                `bson:"height"`
	Width            int                `bson:"width"`
	positions        [][2]int
	randomPos        []int
	currentRandomPos int
}

func (g *Game) CheckCompleted() [][2]int {
	fieldsMap := make(map[int]map[int]GameCharPosition, g.Height)
	for i := 0; i < g.Height; i++ {
		fieldsMap[i] = make(map[int]GameCharPosition, 0)
	}
	for i := range g.Field {
		fieldsMap[g.Field[i].Row][g.Field[i].Col] = g.Field[i]
	}

	completedChar := make(map[int]GameCharPosition, 0)
	checkCompleted := func(completed []GameCharPosition) {
		if len(completed) > 2 {
			for c := range completed {
				completedChar[completed[c].Id] = completed[c]
			}
		}
	}
	for i := range g.Field {
		prev := make([]GameCharPosition, 0)
		prev = append(prev, g.Field[i])
		checkCompleted(checkLeft(fieldsMap, g.Field[i], prev))
		checkCompleted(checkLeftTop(fieldsMap, g.Field[i], prev))
		checkCompleted(checkTop(fieldsMap, g.Field[i], prev))
		checkCompleted(checkTopRight(fieldsMap, g.Field[i], prev))
	}

	result := make([][2]int, 0)
	for _, char := range completedChar {
		result = append(result, [2]int{char.Row, char.Col})
	}
	return result
}

func (g *Game) MoveCharacter(char GameCharPosition, row, col int) ([][2]int, error) {
	path := make([][2]int, 0)
	for i := range g.Field {
		currentChar := &g.Field[i]
		if currentChar.Row == char.Row && currentChar.Col == char.Col {
			path = g.FindPath(currentChar.Row, currentChar.Col, row, col)
			if len(path) > 0 {
				currentChar.Row, currentChar.Col = row, col
				return path, nil
			} else {
				return path, errors.New("Path not found")
			}

		}
	}
	return path, errors.New("Character not found")

}

func (g *Game) AddCharactersToRandomPos(characters parser.CharacterSlice, titleId int) {
	for i := range characters {
		randomRow, randomCol := g.GetRandomPositions()
		randomImg := GetRandomImage(characters[i])
		g.Field = append(g.Field, GameCharPosition{titleId, characters[i].Id, randomImg, randomRow, randomCol})
	}
	g.ShuffleField()
}

func (g *Game) Save() {
	err := mongoDB.C("game").Insert(g)
	if err != nil {
		panic(err)
	}
}

func (g *Game) Update() {
	err := mongoDB.C("game").UpdateId(g.Id, g)
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
	return &Game{RandString(8), make([]GameCharPosition, 0), 9, 9, nil, nil, 0}
}

func GetGame(uuid string) (*Game, error) {
	game := NewGame()
	err := mongoDB.C("game").FindId(uuid).One(game)
	if err != nil {
		return nil, err
	}
	return game, err
}

func GetRandomImage(char parser.Character) string {
	return char.Images[rand.Intn(len(char.Images))]
}

type AnimeGroupMembers struct {
	Id         bson.M `bson:"_id"`
	Members    int    `bson:"members"`
	Characters []int  `bson:"characters"`
}

func CreateNewGame() *Game {
	titlesCount, charCount := 5, 3
	game := NewGame()

	var groupResult []int
	anime := mongoDB.C("anime")
	char := mongoDB.C("char")
	notEmpty := bson.M{"$not": bson.M{"$size": 0}}
	err := anime.Find(bson.M{"characters": notEmpty}).Distinct("group", &groupResult)
	if err != nil {
		panic(err)
	}

	groupsMap := make(map[int]bool, 0)
	uniqueGroups := make([]int, 0)
	for _, v := range groupResult {
		if _, ok := groupsMap[v]; !ok {
			uniqueGroups = append(uniqueGroups, v)
		}
		groupsMap[v] = true
	}

	randomIndexes := rand.Perm(len(uniqueGroups))
	for i := 0; i < titlesCount; i++ {
		groupIndex := uniqueGroups[randomIndexes[i]]

		//get random anime from group by members
		var animeMembers AnimeGroupMembersSlice
		err = anime.Find(bson.M{"characters": notEmpty, "group": groupIndex}).All(&animeMembers)
		if err != nil {
			panic(err)
		}
		randomTitle := animeMembers.GetRandomByMembers()
		titleId := int(randomTitle.Id["i"].(float64))

		//get random character by favorites
		var characters parser.CharacterSlice
		err = char.Find(bson.M{"_id": bson.M{"$in": randomTitle.Characters}}).All(&characters)
		if err != nil {
			panic(err)
		}
		randomCharacters := GetRandomCharactersByFavorites(characters, charCount)

		game.AddCharactersToRandomPos(randomCharacters, titleId)
	}

	return game
}
