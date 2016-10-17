package game

import (
	"bytes"
	"encoding/gob"
	"encoding/json"
	"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/syndtr/goleveldb/leveldb/errors"
	"malmodel"
	"malpar"
	"math/rand"
	"sort"
	"time"
)

const (
	MAX_FROM_ONE_TITLE    = 5
	NOT_ENDED_GAME_SCORES = -1000
)

type GameCharPosition struct {
	TitleId int `json:"-"`
	Id      int `json:"-"`
	Img     string
	Row     int
	Col     int
}

type Game struct {
	Id               string
	Field            []GameCharPosition
	Height           int
	Width            int
	Line             int
	MaxTitleChar     int
	Turn             int
	Score            GameScore
	positions        [][2]int
	randomPos        []int
	currentRandomPos int
	Date             time.Time
	EndDate          time.Time
	Difficulty       int
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

func (g *Game) GetAdvice() (Advice, error) {
	var res Advice
	titlesMap := g.getTitleMap()
	var adviceTitle int

outer:
	for titleId, positions := range titlesMap {
		if len(positions) < 2 {
			continue
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
		if g.isCompleted() || viewedAdvice || g.Difficulty == 0 {
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

	char := malmodel.CharacterModel{Id: gameChar.Id}
	query := gormDB.First(&char)
	err = GetGormError(query)
	if err != nil {
		return result, errors.New(fmt.Sprintf("error: get char %v", err.Error()))
	}
	images := char.GetImages()
	if len(images) == 1 {
		return result, errors.New("Only one image")
	}
	for i, img := range images {
		if img == gameChar.Img {
			nextImage := images[(i+1)%len(images)]
			gameChar.Img = nextImage

			result = ChangedImage{OldImg: character.Img, NewImg: nextImage, Turn: g.Turn, Score: 0}
			if !sameChange {
				if g.Difficulty > 0 && !g.isCompleted() {
					result.Score = -1
				}
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
		if len(g.Field) >= g.Width*g.Height {
			g.CompleteCountTotalScore()
		}
		if g.isCompleted() {
			// delete user list, it can be huge
			g.UserItems = make([]int, 0)
		}

		completedIndexes := make([][2]int, 0)
		for _, char := range append(completed, notInLine...) {
			completedIndexes = append(completedIndexes, [2]int{char.Row, char.Col})
		}
		return MoveResponse{path, completedIndexes, newChars, g.Turn, titleScoreUpdate}, nil
	}
}

func (g *Game) AddNewChars() ([]GameCharPosition, error) {
	result := make([]GameCharPosition, 0)
	addByTurn := 2
	if g.Difficulty > 1 {
		addByTurn = 3
	}
	for i := 0; i < addByTurn; i++ {
		if !g.HasFreePositions() {
			break
		}

		var newChar GameCharPosition
		var err error
		full, required := g.getFullAndRequiredCount()
		if (required - 2) >= full/2 {
			newChar, err = g.getExistedChar(true)
		} else {
			funcRandom := rand.Intn(100)
			switch {
			case len(g.Field) >= g.Width*g.Height:
				break
			case funcRandom < 30:
				newChar, err = g.getExistedChar(true)
			case funcRandom < 60:
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

func (g *Game) AddCharacterToRandomPos(char malmodel.CharacterModel, titleId int) GameCharPosition {
	randomRow, randomCol := g.GetRandomPositions()
	randomImg := GetRandomImage(char)
	newChar := GameCharPosition{titleId, char.Id, randomImg, randomRow, randomCol}
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

func (g *Game) Serialize() ([]byte, error) {
	var buffer bytes.Buffer
	enc := gob.NewEncoder(&buffer)
	err := enc.Encode(g)
	return buffer.Bytes(), err
}

func (g *Game) GetGameModel() (GameModel, error) {
	var res GameModel
	data, err := g.Serialize()
	if err != nil {
		return res, err
	}
	return GameModel{Id: g.Id, GobData: data}, nil
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
	var data []byte
	model := GameModel{Id: uuid, GobData: data}
	err := GetGormError(gormDB.First(&model))
	if err != nil {
		return game, errors.New(fmt.Sprintf("error: get game %v", err.Error()))
	}
	var buffer bytes.Buffer
	buffer.Write(model.GobData)
	dec := gob.NewDecoder(&buffer)
	err = dec.Decode(game)
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
	model, err := g.GetGameModel()
	if err != nil {
		return err
	}
	return GetGormError(gormDB.Save(&model))
}

func (g *Game) AsJson() ([]byte, error) {
	return json.Marshal(g)
}

func GetRandomImage(char malmodel.CharacterModel) string {
	images := char.GetImages()
	return images[rand.Intn(len(images))]
}

func (g *Game) AddRandomCharacterByGroup(GroupId, CharCount int) ([]GameCharPosition, error) {
	var res []GameCharPosition

	//get random anime from group by members
	var animeModels AnimeModelSlice
	query := gormDB.Where(`jsonb_array_length(chars_json) > ? AND "group" = ?`, 2, GroupId).Find(&animeModels)
	errs := query.GetErrors()
	if len(errs) > 0 {
		return res, errors.New(fmt.Sprint(errs))
	}
	randomTitle := animeModels.GetRandomByMembers()

	//get random character by favorites
	//titleChars := randomTitle.GetChars()
	characters, err := randomTitle.GetRelatedCharacters(gormDB)
	if err != nil {
		return res, err
	}
	randomCharacters := GetRandomCharactersByFavorites(randomTitle, CharModelSlice(characters), CharCount, g.Difficulty)
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

func CreateNewGame(gameParam CreateGameParam) (*Game, error) {
	game := NewGameWithParam(gameParam)
	if gameParam.UserName != "" {
		err := game.AddUserScores()
		if err != nil {
			return game, err
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
