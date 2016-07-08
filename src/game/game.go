package game

import (
	"encoding/json"
	"gopkg.in/mgo.v2/bson"
	"mal/parser"
	"math/rand"
	"sort"
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

func (g *Game) ShuffleField() {
	for i := range g.Field {
		j := rand.Intn(i + 1)
		g.Field[i], g.Field[j] = g.Field[j], g.Field[i]
	}
}

func (g *Game) GetRandomPositions() (int, int) {
	if g.positions == nil {
		g.positions = GetAllPositions(g.Width, g.Height)
		g.randomPos = rand.Perm(g.Width * g.Height)
	}
	res := g.positions[g.randomPos[g.currentRandomPos]]
	g.currentRandomPos++
	return res[0], res[1]
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

func GetAllPositions(row, col int) [][2]int {
	result := make([][2]int, row*col)
	for i := 0; i < row; i++ {
		for j := 0; j < col; j++ {
			result[i*col+j] = [2]int{i, j}
		}
	}
	return result
}

func GetRandomImage(char parser.Character) string {
	return char.Images[rand.Intn(len(char.Images))]
}

type AnimeGroupMembers struct {
	Id         bson.M `bson:"_id"`
	Members    int    `bson:"members"`
	Characters []int  `bson:"characters"`
}

type AnimeGroupMembersSlice []AnimeGroupMembers

func (a AnimeGroupMembersSlice) Len() int {
	return len(a)
}

func (a AnimeGroupMembersSlice) Swap(i, j int) {
	a[i], a[j] = a[j], a[i]
}

func (a AnimeGroupMembersSlice) Less(i, j int) bool {
	return a[i].Members < a[j].Members
}

func (a AnimeGroupMembersSlice) GetRandomByMembers() AnimeGroupMembers {
	sort.Sort(sort.Reverse(a))
	fullMembersSum := 0
	for _, a := range a {
		fullMembersSum += a.Members
	}
	randomInt := rand.Intn(fullMembersSum)
	currentSum := 0
	for _, a := range a {
		currentSum += a.Members
		if currentSum >= randomInt {
			return a
		}
	}
	return a[len(a)-1]
}

func GetRandomCharactersByFavorites(c parser.CharacterSlice, n int) parser.CharacterSlice {
	sort.Sort(sort.Reverse(c))
	fullFavoritesSum := 0
	for _, a := range c {
		fullFavoritesSum += a.Favorites
	}

	resultIndexes := make(map[int]bool, 0)
	for i := 0; i < n; i++ {
		randomInt := rand.Intn(fullFavoritesSum)
		currentSum := 0
		for charIndex, char := range c {
			currentSum += char.Favorites
			if _, ok := resultIndexes[charIndex]; currentSum >= randomInt && !ok {
				resultIndexes[charIndex] = true
				break
			}
		}
	}

	result := make(parser.CharacterSlice, 0)
	for index, _ := range resultIndexes {
		result = append(result, c[index])
	}
	return result
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
