package game

import (
	"encoding/json"
	"fmt"
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
	Line             int                `bson:"line"`
	positions        [][2]int
	randomPos        []int
	currentRandomPos int
}

func (g *Game) getExistedChar(required bool) GameCharPosition {
	titleMap := make(map[int][]GameCharPosition, 0)
	for _, v := range g.Field {
		if _, ok := titleMap[v.TitleId]; !ok {
			titleMap[v.TitleId] = make([]GameCharPosition, 0)
		}
		titleMap[v.TitleId] = append(titleMap[v.TitleId], v)
	}

	targetTitles := make([]int, 0)
	for key, titles := range titleMap {
		if required {
			if len(titles) < g.Line {
				targetTitles = append(targetTitles, key)
			}
		} else {
			if len(titles) >= g.Line {
				targetTitles = append(targetTitles, key)
			}
		}
	}

	if len(targetTitles) > 0 {
		selectedTitleId := targetTitles[rand.Intn(len(targetTitles))]
		existedCharacters := make([]int, 0)
		for _, char := range titleMap[selectedTitleId] {
			existedCharacters = append(existedCharacters, char.Id)
		}
		fmt.Println("existed", existedCharacters)
		char := mongoDB.C("char")
		anime := mongoDB.C("anime")
		notEmpty := bson.M{"$not": bson.M{"$size": 0}}

		var titleCharacters []int
		err := anime.Find(bson.M{"characters": notEmpty, "_id.i": selectedTitleId}).Distinct("characters", &titleCharacters)
		if err != nil {
			panic(err)
		}
		var characters parser.CharacterSlice
		err = char.Find(bson.M{"$and": []interface{}{
			bson.M{"_id": bson.M{"$in": titleCharacters}},
			bson.M{"_id": bson.M{"$nin": existedCharacters}},
		}}).All(&characters)
		if err != nil {
			panic(err)
		}
		if len(characters) > 0 {
			fmt.Println("title char without existed", characters)
			randomCharacters := GetRandomCharactersByFavorites(characters, 1)
			fmt.Println("random char", randomCharacters)
			return g.AddCharacterToRandomPos(randomCharacters[0], selectedTitleId)
		}
	}
	return g.getNewGroupChar()
}

func (g *Game) getNewGroupChar() GameCharPosition {
	currentTitles := make([]int, 0)
	for _, v := range g.Field {
		currentTitles = append(currentTitles, v.TitleId)
	}

	anime := mongoDB.C("anime")
	notEmpty := bson.M{"$not": bson.M{"$size": 0}}
	var currentGroups []int
	err := anime.Find(bson.M{"characters": notEmpty, "_id.i": bson.M{"$in": currentTitles}}).Distinct("group", &currentGroups)
	if err != nil {
		panic(err)
	}

	var newGroups []int
	err = anime.Find(bson.M{"characters": notEmpty, "_id.i": bson.M{"$nin": currentGroups}}).Distinct("group", &newGroups)
	if err != nil {
		panic(err)
	}

	uniquerGroups := GetUniqueValues(newGroups)
	targetGroup := uniquerGroups[rand.Intn(len(uniquerGroups))]
	fmt.Println("random new group", targetGroup)
	return g.AddRandomCharacterByGroup(targetGroup, 1)[0]
}

func (g *Game) AddNewChars() []GameCharPosition {
	result := make([]GameCharPosition, 0)
	for i := 0; i < 3; i++ {
		funcRandom := rand.Intn(100)
		var newChar GameCharPosition
		switch {
		case funcRandom < 40:
			newChar = g.getExistedChar(true)
		case funcRandom < 70:
			newChar = g.getExistedChar(false)
		case funcRandom < 100:
			newChar = g.getNewGroupChar()
		}
		fmt.Println(newChar)
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
		if len(completed) >= g.Line {
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
		g.RemoveChar(char)
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

func NewGame() *Game {
	return &Game{RandString(8), make([]GameCharPosition, 0), 9, 9, 3, nil, nil, 0}
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
	randomCharacters := GetRandomCharactersByFavorites(characters, CharCount)
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

func CreateNewGame() *Game {
	titlesCount, charCount := 5, 3
	game := NewGame()

	var groupResult []int
	anime := mongoDB.C("anime")
	notEmpty := bson.M{"$not": bson.M{"$size": 0}}
	err := anime.Find(bson.M{"characters": notEmpty}).Distinct("group", &groupResult)
	if err != nil {
		panic(err)
	}

	uniqueGroups := GetUniqueValues(groupResult)
	randomIndexes := rand.Perm(len(uniqueGroups))
	for i := 0; i < titlesCount; i++ {
		groupId := uniqueGroups[randomIndexes[i]]
		game.AddRandomCharacterByGroup(groupId, charCount)
	}

	return game
}
