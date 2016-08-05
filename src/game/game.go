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

const (
	MAX_FROM_ONE_TITLE = 5
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
	MaxTitleChar     int                `bson:"max_title_char"`
	Turn             int                `bson:"turn"`
	Score            GameScore
	positions        [][2]int
	randomPos        []int
	currentRandomPos int
	Date             time.Time `bson:"date"`
	EndDate          time.Time `bson:"enddate"`
	CharDiff         int
	AnimeDiff        int
	UserName         string
	UserItems        []int
}

type MoveResponse struct {
	Path      [][2]int
	Completed [][2]int
	NewChars  []GameCharPosition
	NextTurn  int
	GameScore []CompleteTitle
}

func NewGame() *Game {
	gameScore := GameScore{CompletedTitles: make([]CompleteTitle, 0), CompletedGroups: make([]int, 0), TotalScore: -1,
		ChangeImgs: make([]ChangedImage, 0), Advices: make([]Advice, 0)}
	return &Game{Id: RandString(8), Field: make([]GameCharPosition, 0), Height: 9, Width: 9, Line: 3, MaxTitleChar: 5, Turn: 1,
		Score: gameScore, positions: nil, randomPos: nil, currentRandomPos: 0, Date: time.Now(), EndDate: time.Now(),
		CharDiff: 0, AnimeDiff: 0, UserName: "", UserItems: make([]int, 0)}
}

func NewGameWithParam(param CreateGameParam) *Game {
	game := NewGame()
	game.CharDiff = param.CharDiff
	game.AnimeDiff = param.AnimeDiff
	game.UserName = param.UserName
	return game
}

func (g *Game) GetAdvice() (Advice, error) {
	var res Advice
	titlesMap := g.getTitleMap()
	var adviceTitle int

outer:
	for titleId, positions := range titlesMap {
		if len(positions) < 2 {
			break
		}
		for _, advice := range g.Score.Advices {
			if advice.Title == titleId {
				continue outer
			}
		}
		adviceTitle = titleId
		break

	}

	viewedAdvice := false
	if adviceTitle == 0 && len(g.Score.Advices) > 0 {
		for i, advice := range g.Score.Advices {
			if _, ok := titlesMap[advice.Title]; ok {
				adviceTitle = g.Score.Advices[i].Title
				g.Score.Advices = append(g.Score.Advices[:i], g.Score.Advices[i+1:]...)
				viewedAdvice = true
				break
			}
		}
	}

	if adviceTitle != 0 {
		positions, _ := titlesMap[adviceTitle]
		images := make([]string, 0)
		for _, pos := range positions {
			images = append(images, pos.Img)
		}
		score := -3
		if g.isCompleted() || viewedAdvice {
			score = 0
		}
		res = Advice{Img: images, Title: adviceTitle, Turn: g.Turn, Score: score}
		g.Score.Advices = append(g.Score.Advices, res)
	} else {
		return res, errors.New("Can't find advice")
	}

	return res, nil
}

func (g *Game) ChangeImage(character GameCharPosition) (ChangedImage, error) {
	var result ChangedImage
	gameChar, err := g.FindChar(character.Row, character.Col)
	if err != nil {
		return result, err
	}

	sameChange := false
	for _, change := range g.Score.ChangeImgs {
		if change.OldImg == gameChar.Img {
			sameChange = true
			break
		}
	}

	var char parser.Character
	charCol := mongoDB.C("char")
	err = charCol.Find(bson.M{"_id": gameChar.Id}).One(&char)
	if err != nil {
		return result, err
	}
	if len(char.Images) == 1 {
		return result, errors.New("Only one image")
	}
	for i, img := range char.Images {
		if img == gameChar.Img {
			nextImage := char.Images[(i+1)%len(char.Images)]
			gameChar.Img = nextImage

			result = ChangedImage{OldImg: character.Img, NewImg: nextImage, Turn: g.Turn, Score: 0}
			if !sameChange {
				result.Score = -1
				g.Score.ChangeImgs = append(g.Score.ChangeImgs, result)
			}
			return result, nil
		}
	}
	return result, errors.New("No image for change")
}

func (g *Game) FindChar(row, col int) (*GameCharPosition, error) {
	for i := range g.Field {
		currentChar := &g.Field[i]
		if currentChar.Row == row && currentChar.Col == col {
			return currentChar, nil
		}
	}
	var res *GameCharPosition
	return res, errors.New("Char not found")
}

func (g *Game) MakeTurn(char GameCharPosition, row, col int) (MoveResponse, error) {
	var res MoveResponse
	path, err := g.MoveCharacter(char, row, col)
	if err != nil {
		return res, err
	} else {
		completed, notInLine := g.CheckCompleted()
		titleScoreUpdate, err := g.UpdateGameScore(completed, notInLine)
		if err != nil {
			return res, err
		}
		newChars, err := g.AddNewChars()
		if err != nil {
			return res, err
		}
		if g.Score.TotalScore >= 0 {
			g.UserItems = make([]int, 0)
		}
		g.Update()

		completedIndexes := make([][2]int, 0)
		for _, char := range append(completed, notInLine...) {
			completedIndexes = append(completedIndexes, [2]int{char.Row, char.Col})
		}
		return MoveResponse{path, completedIndexes, newChars, g.Turn, titleScoreUpdate}, nil
	}
}

func (g *Game) AddNewChars() ([]GameCharPosition, error) {
	result := make([]GameCharPosition, 0)
	for i := 0; i < 3; i++ {
		var newChar GameCharPosition
		var err error
		full, required := g.getFullAndRequiredCount()
		if required >= full/2 {
			newChar, err = g.getExistedChar(true)
		} else {
			funcRandom := rand.Intn(100)
			switch {
			case len(g.Field) >= g.Width*g.Height:
				break
			case funcRandom < 40:
				newChar, err = g.getExistedChar(true)
			case funcRandom < 70:
				newChar, err = g.getExistedChar(false)
			case funcRandom < 100:
				newChar, err = g.getNewGroupChar()
			}
		}
		if err != nil {
			return result, err
		}
		result = append(result, newChar)
	}
	return result, nil
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

func (g *Game) Save() error {
	return mongoDB.C("game").Insert(g)
}

func (g *Game) Update() error {
	return mongoDB.C("game").UpdateId(g.Id, g)
}

func (g *Game) AsJson() ([]byte, error) {
	return json.Marshal(g)
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

func (g *Game) AddRandomCharacterByGroup(GroupId, CharCount int) ([]GameCharPosition, error) {
	var res []GameCharPosition
	anime := mongoDB.C("anime")
	char := mongoDB.C("char")
	exists := bson.M{"$exists": true}

	//get random anime from group by members
	var animeMembers AnimeGroupMembersSlice
	err := anime.Find(bson.M{"characters.2": exists, "group": GroupId}).All(&animeMembers)
	if err != nil {
		return res, err
	}
	randomTitle := animeMembers.GetRandomByMembers()
	titleId := 0
	switch randomTitle.Id["i"].(type) {
	case int:
		titleId = randomTitle.Id["i"].(int)
	case float64:
		titleId = int(randomTitle.Id["i"].(float64))
	}
	//get random character by favorites
	var characters parser.CharacterSlice
	err = char.Find(bson.M{"_id": bson.M{"$in": randomTitle.Characters}}).All(&characters)
	if err != nil {
		return res, err
	}
	randomCharacters := GetRandomCharactersByFavorites(titleId, characters, CharCount, g.CharDiff)
	return g.AddCharactersToRandomPos(randomCharacters, titleId), nil

}

func CreateNewGame(gameParam CreateGameParam) (*Game, error) {
	game := NewGameWithParam(gameParam)
	if gameParam.UserName != "" {
		userList, err := malpar.GetUserScoresByName(game.UserName, 2)
		if err != nil {
			return game, err
		}
		for _, item := range userList.AnimeList {
			// 1 watching, 2 completed, 3 on hold, 4 drop
			if item.Status > 0 && item.Status <= 3 {
				game.UserItems = append(game.UserItems, int(item.Id))
			}
		}

	}

	for i := 0; i < 3; i++ {
		_, err := game.AddNewChars()
		if err != nil {
			return game, err
		}
	}

	return game, nil
}
