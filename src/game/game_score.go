package game

import (
	"errors"
	"fmt"
	"github.com/jinzhu/gorm"
	"malmodel"
)

type CompletedChar struct {
	Id    int
	Name  string
	Img   string
	Score int
}

type CompleteTitle struct {
	Id         int
	Title      string
	English    string
	Turn       int
	Characters []CompletedChar
}

type ChangedImage struct {
	NewImg string
	OldImg string
	Turn   int
	Score  int
}

type Advice struct {
	Img   []string
	Title int
	Turn  int
	Score int
}

type GameScore struct {
	CompletedTitles []CompleteTitle
	CompletedGroups []int
	TotalScore      int
	ChangeImgs      []ChangedImage
	Advices         []Advice
}

func (g *Game) GetCompletedGroups(completedChars GameCharPositionSlice) ([]int, error) {
	var completedGroups []int
	var query *gorm.DB
	if len(completedChars) > 0 {
		query = gormDB.Table("anime_models").Where("jsonb_array_length(chars_json) > ? and id in (?)", 2, completedChars.GetTitlesIds()).Pluck("group_id", &completedGroups)
		err := GetGormError(query)
		if err != nil {
			return completedGroups, errors.New(fmt.Sprintf("error: get completed groups %v", err.Error()))
		}
		return GetUniqueValues(completedGroups), nil
	}
	return completedGroups, nil

}

func (g *Game) isCompleted() bool {
	return g.Score.TotalScore != NOT_ENDED_GAME_SCORES
}

func (g *Game) GetCompletedTitles(completedChars GameCharPositionSlice, notInLine GameCharPositionSlice, lineScore, notLineScore int) ([]CompleteTitle, error) {
	var res []CompleteTitle

	var charactersData CharModelSlice
	query := gormDB.Where("id in (?)", append(completedChars.GetIds(), notInLine.GetIds()...)).Find(&charactersData)
	err := GetGormError(query)
	if err != nil {
		return res, errors.New(fmt.Sprintf("error: get characters %v", err.Error()))
	}
	charNames := make(map[int]string, 0)
	for _, char := range charactersData {
		charNames[char.Id] = char.Name
	}

	completedTitlesMap := make(map[int]*CompleteTitle, 0)
	for _, char := range completedChars {
		if _, ok := completedTitlesMap[char.TitleId]; !ok {
			titleData := malmodel.AnimeModel{Id: char.TitleId}
			query := gormDB.First(&titleData)
			err := GetGormError(query)
			if err != nil {
				return res, errors.New(fmt.Sprintf("error: get complete title %v", err.Error()))
			}
			newCompTitle := CompleteTitle{char.TitleId, titleData.Title, titleData.English, g.Turn, make([]CompletedChar, 0)}
			completedTitlesMap[char.TitleId] = &newCompTitle
		}
		title, _ := completedTitlesMap[char.TitleId]
		name, _ := charNames[char.Id]
		score := (len(title.Characters) + 1) * lineScore
		title.Characters = append(title.Characters, CompletedChar{char.Id, name, char.Img, score})
	}

	for _, char := range notInLine {
		title, _ := completedTitlesMap[char.TitleId]
		name, _ := charNames[char.Id]
		title.Characters = append(title.Characters, CompletedChar{char.Id, name, char.Img, notLineScore})
	}

	result := make([]CompleteTitle, 0)
	for _, val := range completedTitlesMap {
		result = append(result, *val)
	}
	return result, nil
}

func (g *Game) UpdateGameScore(completedChars GameCharPositionSlice, notInLine GameCharPositionSlice, lineScore, notLineScore int) ([]CompleteTitle, error) {
	logger.Println("update game score")
	res := make([]CompleteTitle, 0)
	if len(completedChars) != 0 {
		completedGroups, err := g.GetCompletedGroups(completedChars)
		logger.Printf("completed groups %v\n", completedGroups)
		if err != nil {
			return res, err
		}
		g.Score.CompletedGroups = append(g.Score.CompletedGroups, completedGroups...)

		res, err = g.GetCompletedTitles(completedChars, notInLine, lineScore, notLineScore)
		if err != nil {
			return res, err
		}
		g.Score.CompletedTitles = append(g.Score.CompletedTitles, res...)
	}
	g.Turn++
	return res, nil
}
