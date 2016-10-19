package game

import (
	"encoding/json"
	"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"malmodel"
	"malpar"
	"math/rand"
	"sort"
	"time"
	"errors"
)

const (
	MAX_FROM_ONE_TITLE    = 5
	NOT_ENDED_GAME_SCORES = -1000
)

type GameCharPositionSlice []GameCharPosition
type GameCharPosition struct {
	TitleId int
	Id      int
	Img     string
	Row     int
	Col     int
}

type Game struct {
	Id               string
	Field            GameCharPositionSlice
	Height           int
	Width            int
	Line             int
	MaxTitleChar     int
	Turn             int
	Score            GameScore
	Date             time.Time
	EndDate          time.Time
	Difficulty       int
	UserName         string
	UserItems        []int
	positions        [][2]int
	randomPos        []int
	currentRandomPos int
}

type MoveResponse struct {
	Path      [][2]int
	Completed [][2]int
	NewChars  []HiddenGameCharPosition
	NextTurn  int
	GameScore []CompleteTitle
}

func NewGame() *Game {
	gameScore := GameScore{CompletedTitles: make([]CompleteTitle, 0), CompletedGroups: make([]int, 0), TotalScore: NOT_ENDED_GAME_SCORES,
		ChangeImgs: make([]ChangedImage, 0), Advices: make([]Advice, 0)}
	return &Game{Id: RandString(8), Field: make([]GameCharPosition, 0), Height: 9, Width: 9, Line: 3, MaxTitleChar: 5, Turn: 1,
		Score: gameScore, positions: nil, randomPos: nil, currentRandomPos: 0, Date: time.Now(), EndDate: time.Now(),
		Difficulty: 0, UserName: "", UserItems: make([]int, 0)}
}

func NewGameWithParam(param CreateGameParam) *Game {
	game := NewGame()
	game.Difficulty = param.Diff
	game.UserName = param.UserName
	return game
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

func (g *Game) GetAddByTurn() int {
	if g.Difficulty > 1 {
		return 3
	}
	return 2
}

func (g *Game) AddNewChars() (GameCharPositionSlice, error) {
	logger.Println("add new character")
	result := make([]GameCharPosition, 0)
	addByTurn := g.GetAddByTurn()
	for i := 0; i < addByTurn; i++ {
		if !g.HasFreePositions() {
			break
		}

		var newChar GameCharPosition
		var err error
		// full - maximum set of chars from title
		// required - not full set
		full, required := g.getFullAndRequiredCount()
		logger.Printf("full sets %v, required sets %v\n", full, required)
		if (required - 2) >= full/2 {
			newChar, err = g.addExistedChar(true)
		} else {
			funcRandom := rand.Intn(100)
			switch {
			case funcRandom < 30:
				newChar, err = g.addExistedChar(true)
			case funcRandom < 60:
				newChar, err = g.addExistedChar(false)
			case funcRandom < 100:
				newChar, err = g.addNewGroupChar()
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
	logger.Printf("remove character %v\n", toDelete)
	for i := range g.Field {
		if g.Field[i].Id == toDelete.Id {
			g.Field = append(g.Field[:i], g.Field[i+1:]...)
			break
		}
	}
}

func (g *Game) CheckCompleted() (GameCharPositionSlice, GameCharPositionSlice) {
	logger.Println("find completed")
	fieldsMap := make(map[int]map[int]GameCharPosition, g.Height)
	for i := 0; i < g.Width; i++ {
		fieldsMap[i] = make(map[int]GameCharPosition, 0)
	}
	for i := range g.Field {
		fieldsMap[g.Field[i].Row][g.Field[i].Col] = g.Field[i]
	}

	completedChar := make(map[int]GameCharPosition, 0)
	completedTitles := make(map[int]bool, 0)
	checkCompleted := func(completed GameCharPositionSlice) {
		if len(completed) >= g.Line {
			for c := range completed {
				completedChar[completed[c].Id] = completed[c]
				completedTitles[completed[c].TitleId] = true
			}
		}
	}
	for i := range g.Field {
		prev := make(GameCharPositionSlice, 1)
		prev[0] = g.Field[i]
		checkCompleted(checkLeft(fieldsMap, g.Field[i], prev))
		prev = prev[0:1]
		checkCompleted(checkLeftTop(fieldsMap, g.Field[i], prev))
		prev = prev[0:1]
		checkCompleted(checkTop(fieldsMap, g.Field[i], prev))
		prev = prev[0:1]
		checkCompleted(checkTopRight(fieldsMap, g.Field[i], prev))
	}
	completedSlice := make(GameCharPositionSlice, 0)
	for _, char := range completedChar {
		completedSlice = append(completedSlice, char)
	}

	notLineSlice := make(GameCharPositionSlice, 0)
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
	logger.Printf("completed %v not in line %v\n", completedSlice, notLineSlice)
	return completedSlice, notLineSlice
}

func (g *Game) MoveCharacter(char GameCharPosition, row, col int) ([][2]int, error) {
	logger.Println("find path")
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

func (g *Game) AddCharacterToRandomPos(char malmodel.CharacterModel, titleId int) GameCharPosition {
	randomRow, randomCol := g.GetRandomPositions()
	randomImg := GetRandomImage(char)
	newChar := GameCharPosition{titleId, char.Id, randomImg, randomRow, randomCol}
	logger.Printf("add character %v", newChar)
	g.Field = append(g.Field, newChar)
	return newChar
}

func (g *Game) AddCharactersToRandomPos(characters CharModelSlice, titleId int) []GameCharPosition {
	result := make([]GameCharPosition, 0)
	for i := range characters {
		newChar := g.AddCharacterToRandomPos(characters[i], titleId)
		result = append(result, newChar)
	}
	g.ShuffleField()
	return result
}

func (g *Game) GetGameModel() (GameModel, error) {
	var res GameModel
	data, err := json.Marshal(g)
	if err != nil {
		return res, err
	}
	return GameModel{Id: g.Id, GameJson: string(data)}, nil
}

func GetGormError(db *gorm.DB) error {
	errs := db.GetErrors()
	if len(errs) > 0 {
		return errors.New(fmt.Sprint(errs))
	}
	return nil
}

func GetGame(uuid string) (*Game, error) {
	game := NewGame()
	model := GameModel{Id: uuid}
	err := GetGormError(gormDB.First(&model))
	if err != nil {
		return game, errors.New(fmt.Sprintf("error: get game %v", err.Error()))
	}
	err = json.Unmarshal([]byte(model.GameJson), &game)
	if err != nil {
		return game, err
	}
	return game, err
}

func (g *Game) Save() error {
	model, err := g.GetGameModel()
	if err != nil {
		return err
	}
	return GetGormError(gormDB.Create(&model))
}

func (g *Game) Update() error {
	logger.Printf("update game %v\n", g.Id)
	model, err := g.GetGameModel()
	if err != nil {
		return err
	}
	return GetGormError(gormDB.Save(&model))
}

type HiddenGameCharPosition struct {
	Img string
	Row int
	Col int
}

type HiddenGame struct {
	Game
	Field []HiddenGameCharPosition
}

func (g *Game) AsJson() ([]byte, error) {
	hg := HiddenGame{Game: *g, Field: g.Field.GetHidden()}
	hg.UserItems = make([]int, 0)
	return json.Marshal(hg)
}

func GetRandomImage(char malmodel.CharacterModel) string {
	images := char.GetImages()
	return images[rand.Intn(len(images))]
}

func (g *Game) AddRandomCharacterByGroup(GroupId, CharCount int) ([]GameCharPosition, error) {
	logger.Printf("add random character from group %v\n", GroupId)
	var res []GameCharPosition

	//get random anime from group by members
	var animeModels AnimeModelSlice
	query := gormDB.Where("jsonb_array_length(chars_json) > ? AND group_id = ?", 2, GroupId).Find(&animeModels)
	if errs := query.GetErrors(); len(errs) > 0 {
		return res, errors.New(fmt.Sprint(errs))
	}
	randomTitle := animeModels.GetRandomByMembers()
	logger.Printf("selected title %v\n", randomTitle.Title)

	//get random character by favorites
	//titleChars := randomTitle.GetChars()
	characters, mainCharsMap, err := randomTitle.GetRelatedCharacters(gormDB)
	if err != nil {
		return res, err
	}
	randomCharacters := CharModelSlice(characters).GetRandomByFavorites(mainCharsMap, CharCount, g.Difficulty)
	return g.AddCharactersToRandomPos(randomCharacters, randomTitle.Id), nil

}

type AnimeTitleSlice []malpar.AnimeTitle

func (a AnimeTitleSlice) Len() int {
	return len(a)
}

func (a AnimeTitleSlice) Swap(i, j int) {
	a[i], a[j] = a[j], a[i]
}

var halfYear = 365 * 24 * 60 * 60

func (a AnimeTitleSlice) Less(i, j int) bool {
	// less than half year = 10 points
	// 10 score = 10 points

	currentUnix := int(time.Now().Unix())
	ai_time_points := 10 - (currentUnix-a[i].LastUpdate)/halfYear
	aj_time_points := 10 - (currentUnix-a[j].LastUpdate)/halfYear
	return int(a[i].Score)+ai_time_points < int(a[j].Score)+aj_time_points
}

func (g *Game) AddUserScores() error {
	if g.UserName == "" {
		return nil
	}
	logger.Println("add user scores")
	userList, err := malpar.GetUserScoresByName(g.UserName, 2)
	if err != nil {
		return err
	}
	userListSlice := AnimeTitleSlice(userList.AnimeList)
	sort.Sort(sort.Reverse(userListSlice))
	for _, item := range userListSlice {
		// 1 watching, 2 completed, 3 on hold, 4 drop
		if item.Status > 0 && item.Status <= 3 {
			g.UserItems = append(g.UserItems, int(item.Id))
		}
	}
	return nil
}

func (g *Game) GetLessLineTitles() []int {
	titleMap := g.getTitleMap()
	targetTitles := make([]int, 0)
	for key, titlesChars := range titleMap {
		if len(titlesChars) < g.Line {
			targetTitles = append(targetTitles, key)
		}
	}
	return targetTitles
}

func (g *Game) GetMoreLineTitles() []int {
	titleMap := g.getTitleMap()
	targetTitles := make([]int, 0)
	for key, titlesChars := range titleMap {
		if len(titlesChars) >= g.Line && len(titlesChars) < MAX_FROM_ONE_TITLE {
			targetTitles = append(targetTitles, key)
		}
	}
	return targetTitles
}

func (chars GameCharPositionSlice) GetIds() []int {
	existedCharacters := make([]int, 0)
	for _, char := range chars {
		existedCharacters = append(existedCharacters, char.Id)
	}
	return existedCharacters
}

func (chars GameCharPositionSlice) GetTitlesIds() []int {
	titlesIds := make([]int, 0)
	for _, char := range chars {
		titlesIds = append(titlesIds, char.TitleId)
	}
	return titlesIds
}

func (chars GameCharPositionSlice) GetHidden() []HiddenGameCharPosition {
	hiddenFields := make([]HiddenGameCharPosition, 0)
	for _, field := range chars {
		hiddenFields = append(hiddenFields, HiddenGameCharPosition{Img: field.Img, Row: field.Row, Col: field.Col})
	}
	return hiddenFields
}
