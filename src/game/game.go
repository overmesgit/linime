package game

import (
	"encoding/json"
	"github.com/syndtr/goleveldb/leveldb/errors"
	"gopkg.in/mgo.v2/bson"
	"mal/parser"
	"malpar"
	"math/rand"
	"time"
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
	Line             int                `bson:"line"`
	Turn             int                `bson:"turn"`
	Score            GameScore
	positions        [][2]int
	randomPos        []int
	currentRandomPos int
	Date             time.Time `bson:"date"`
	CharDiff         int
	AnimeDiff        int
	UserName         string
	UserItems        []int
}

func NewGame() *Game {
	gameScore := GameScore{make([]CompleteTitle, 0), make([]int, 0), -1}
	return &Game{RandString(8), make([]GameCharPosition, 0), 9, 9, 3, 1, gameScore, nil, nil, 0, time.Now(), 0, 0, "", make([]int, 0)}
}

func NewGameWithParam(param CreateGameParam) *Game {
	game := NewGame()
	game.CharDiff = param.CharDiff
	game.AnimeDiff = param.AnimeDiff
	game.UserName = param.UserName
	return game
}

type MoveResponse struct {
	Path         [][2]int
	Completed    [][2]int
	NewChars     []GameCharPosition
	CompletedNew [][2]int
	NextTurn     int
	GameScore    []CompleteTitle
}

func (g *Game) MakeTurn(char GameCharPosition, row, col int) (MoveResponse, error) {
	var res MoveResponse
	if g.Score.TotalScore >= 0 {
		return res, errors.New("Game completed")
	}
	path, err := g.MoveCharacter(char, row, col)
	if err != nil {
		return res, err
	} else {
		completed, notInLine := g.CheckCompleted()

		newChars := g.AddNewChars()
		completedNew, notInLineNew := g.CheckCompleted()

		titleScoreUpdate := g.UpdateGameScore(append(completed, completedNew...), append(notInLine, notInLineNew...))
		if g.Score.TotalScore >= 0 {
			g.UserItems = make([]int, 0)
		}
		g.Update()

		completedIndexes := make([][2]int, 0)
		for _, char := range append(completed, notInLine...) {
			completedIndexes = append(completedIndexes, [2]int{char.Row, char.Col})
		}
		completedIndexesNew := make([][2]int, 0)
		for _, char := range append(completedNew, notInLineNew...) {
			completedIndexesNew = append(completedIndexesNew, [2]int{char.Row, char.Col})
		}
		return MoveResponse{path, completedIndexes, newChars, completedIndexesNew, g.Turn, titleScoreUpdate}, nil
	}
}

func (g *Game) AddNewChars() []GameCharPosition {
	result := make([]GameCharPosition, 0)
	for i := 0; i < 3; i++ {
		funcRandom := rand.Intn(100)
		var newChar GameCharPosition
		switch {
		case len(g.Field) >= g.Width*g.Height:
			break
		case funcRandom < 50:
			newChar = g.getExistedChar(true)
		case funcRandom < 80:
			newChar = g.getExistedChar(false)
		case funcRandom < 100:
			newChar = g.getNewGroupChar()
		}
		result = append(result, newChar)
	}
	return result
}

func (g *Game) RemoveChar(toDelete GameCharPosition) {
	for i := range g.Field {
		if g.Field[i].Id == toDelete.Id {
			g.Field = append(g.Field[:i], g.Field[i+1:]...)
			break
		}
	}
}

func (g *Game) CheckCompleted() ([]GameCharPosition, []GameCharPosition) {
	fieldsMap := make(map[int]map[int]GameCharPosition, g.Height)
	for i := 0; i < g.Height; i++ {
		fieldsMap[i] = make(map[int]GameCharPosition, 0)
	}
	for i := range g.Field {
		fieldsMap[g.Field[i].Row][g.Field[i].Col] = g.Field[i]
	}

	completedChar := make(map[int]GameCharPosition, 0)
	completedTitles := make(map[int]bool, 0)
	checkCompleted := func(completed []GameCharPosition) {
		if len(completed) >= g.Line {
			for c := range completed {
				completedChar[completed[c].Id] = completed[c]
				completedTitles[completed[c].TitleId] = true
			}
		}
	}
	for i := range g.Field {
		prev := make([]GameCharPosition, 1)
		prev[0] = g.Field[i]
		checkCompleted(checkLeft(fieldsMap, g.Field[i], prev))
		prev = prev[0:1]
		checkCompleted(checkLeftTop(fieldsMap, g.Field[i], prev))
		prev = prev[0:1]
		checkCompleted(checkTop(fieldsMap, g.Field[i], prev))
		prev = prev[0:1]
		checkCompleted(checkTopRight(fieldsMap, g.Field[i], prev))
	}
	completedSlice := make([]GameCharPosition, 0)
	for _, char := range completedChar {
		completedSlice = append(completedSlice, char)
	}

	notLineSlice := make([]GameCharPosition, 0)
	for _, v := range g.Field {
		if _, ok := completedTitles[v.TitleId]; ok {
			if _, ok := completedChar[v.Id]; !ok {
				notLineSlice = append(notLineSlice, v)
			}
		}
	}
	for _, char := range append(completedSlice, notLineSlice...) {
		g.RemoveChar(char)
	}
	return completedSlice, notLineSlice
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

func (g *Game) AddCharacterToRandomPos(char parser.Character, titleId int) GameCharPosition {
	randomRow, randomCol := g.GetRandomPositions()
	randomImg := GetRandomImage(char)
	newChar := GameCharPosition{titleId, char.Id, randomImg, randomRow, randomCol}
	g.Field = append(g.Field, newChar)
	return newChar
}

func (g *Game) AddCharactersToRandomPos(characters parser.CharacterSlice, titleId int) []GameCharPosition {
	result := make([]GameCharPosition, 0)
	for i := range characters {
		newChar := g.AddCharacterToRandomPos(characters[i], titleId)
		result = append(result, newChar)
	}
	g.ShuffleField()
	return result
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
	Title      string `bson:"title"`
	English    string `bson:"english"`
	Characters []int  `bson:"characters"`
}

func (g *Game) AddRandomCharacterByGroup(GroupId, CharCount int) []GameCharPosition {
	anime := mongoDB.C("anime")
	char := mongoDB.C("char")
	notEmpty := bson.M{"$not": bson.M{"$size": 0}}

	//get random anime from group by members
	var animeMembers AnimeGroupMembersSlice
	err := anime.Find(bson.M{"characters": notEmpty, "group": GroupId}).All(&animeMembers)
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
	randomCharacters := GetRandomCharactersByFavorites(characters, CharCount, g.CharDiff)
	return g.AddCharactersToRandomPos(randomCharacters, titleId)

}

func GetUniqueValues(values []int) []int {
	uniqueMap := make(map[int]bool, 0)
	unique := make([]int, 0)
	for _, v := range values {
		if _, ok := uniqueMap[v]; !ok {
			unique = append(unique, v)
		}
		uniqueMap[v] = true
	}
	return unique

}

func CreateNewGame(gameParam CreateGameParam) *Game {
	game := NewGameWithParam(gameParam)
	if gameParam.UserName != "" {
		userList, err := malpar.GetUserScoresByName(game.UserName, 2)
		if err != nil {
			panic(err)
		}
		for _, item := range userList.AnimeList {
			// 1 watching, 2 completed, 3 on hold, 4 drop
			if item.Status > 0 && item.Status <= 3 {
				game.UserItems = append(game.UserItems, int(item.Id))
			}
		}

	}

	for i := 0; i < 3; i++ {
		game.AddNewChars()
	}

	return game
}
