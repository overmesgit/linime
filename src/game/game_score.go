package game

import (
	"errors"
	"fmt"
	"github.com/jinzhu/gorm"
	"malmodel"
	"strconv"
	"time"
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

func (g *Game) GetCompletedGroups(completedChars []GameCharPosition) ([]int, error) {
	completedTitles := make([]string, 0)
	for _, char := range completedChars {
		completedTitles = append(completedTitles, strconv.Itoa(char.TitleId))
	}

	var completedGroups []int
	var query *gorm.DB
	if len(completedGroups) > 0 {
		query = gormDB.Table("anime_models").Where("jsonb_array_length(chars_json) > ? and id in (?)", 2, completedTitles).Pluck("group", &completedGroups)
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

func (g *Game) GetCompletedTitles(completedChars []GameCharPosition, notInLine []GameCharPosition) ([]CompleteTitle, error) {
	var res []CompleteTitle
	charactersIds := make([]string, 0)
	for _, char := range append(completedChars, notInLine...) {
		charactersIds = append(charactersIds, strconv.Itoa(char.Id))
	}

	var charactersData CharModelSlice
	query := gormDB.Where("id in (?)", charactersIds).Find(&charactersData)
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
		title.Characters = append(title.Characters, CompletedChar{char.Id, name, char.Img, len(title.Characters) + 1})
	}

	for _, char := range notInLine {
		title, _ := completedTitlesMap[char.TitleId]
		name, _ := charNames[char.Id]
		title.Characters = append(title.Characters, CompletedChar{char.Id, name, char.Img, -1})
	}

	result := make([]CompleteTitle, 0)
	for _, val := range completedTitlesMap {
		result = append(result, *val)
	}
	return result, nil
}

func (g *Game) UpdateGameScore(completedChars []GameCharPosition, notInLine []GameCharPosition) ([]CompleteTitle, error) {
	res := make([]CompleteTitle, 0)
	if len(completedChars) != 0 {

		completedGroups, err := g.GetCompletedGroups(completedChars)
		if err != nil {
			return res, err
		}
		g.Score.CompletedGroups = append(g.Score.CompletedGroups, completedGroups...)

		res, err = g.GetCompletedTitles(completedChars, notInLine)
		if err != nil {
			return res, err
		}
		g.Score.CompletedTitles = append(g.Score.CompletedTitles, res...)
	}
	g.Turn++
	return res, nil
}

func (g *Game) CompleteCountTotalScore() {
	totalScore := 0
	for _, title := range g.Score.CompletedTitles {
		for _, char := range title.Characters {
			totalScore += char.Score
		}
	}
	g.Score.TotalScore = totalScore
	for _, change := range g.Score.ChangeImgs {
		g.Score.TotalScore += change.Score
	}
	for _, advice := range g.Score.Advices {
		g.Score.TotalScore += advice.Score
	}
	g.EndDate = time.Now()
}
