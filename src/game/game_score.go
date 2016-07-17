package game

import (
	"gopkg.in/mgo.v2/bson"
	"mal/parser"
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

type GameScore struct {
	CompletedTitles []CompleteTitle
	CompletedGroups []int
	TotalScore      int
}

func (g *Game) GetCompletedGroups(completedChars []GameCharPosition) []int {
	completedTitles := make([]int, 0)
	for _, char := range completedChars {
		completedTitles = append(completedTitles, char.TitleId)
	}

	anime := mongoDB.C("anime")
	notEmpty := bson.M{"$not": bson.M{"$size": 0}}
	var completedGroups []int
	anime.Find(bson.M{"characters": notEmpty, "_id.i": bson.M{"$in": completedTitles}}).Distinct("group", &completedGroups)
	return GetUniqueValues(completedGroups)
}

func (g *Game) GetCompletedTitles(completedChars []GameCharPosition, notInLine []GameCharPosition) ([]CompleteTitle, error) {
	var res []CompleteTitle
	charactersIds := make([]int, 0)
	for _, char := range append(completedChars, notInLine...) {
		charactersIds = append(charactersIds, char.Id)
	}

	char := mongoDB.C("char")
	var charactersData parser.CharacterSlice
	err := char.Find(bson.M{"_id": bson.M{"$in": charactersIds}}).All(&charactersData)
	if err != nil {
		return res, err
	}
	charNames := make(map[int]string, 0)
	for _, char := range charactersData {
		charNames[char.Id] = char.Name
	}

	anime := mongoDB.C("anime")
	exists := bson.M{"$exists": true}
	completedTitlesMap := make(map[int]*CompleteTitle, 0)
	for _, char := range completedChars {
		if _, ok := completedTitlesMap[char.TitleId]; !ok {
			var titleData AnimeGroupMembers
			err := anime.Find(bson.M{"characters.0": exists, "_id.i": char.TitleId}).One(&titleData)
			if err != nil {
				return res, err
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
	var res []CompleteTitle
	g.Score.CompletedGroups = append(g.Score.CompletedGroups, g.GetCompletedGroups(completedChars)...)

	titles, err := g.GetCompletedTitles(completedChars, notInLine)
	if err != nil {
		return res, err
	}
	g.Score.CompletedTitles = append(g.Score.CompletedTitles, titles...)

	g.Turn++
	if len(g.Field) >= g.Width*g.Height {
		g.CompleteCountTotalScore()
	}
	return titles, nil
}

func (g *Game) CompleteCountTotalScore() {
	totalScore := 0
	for _, title := range g.Score.CompletedTitles {
		for _, char := range title.Characters {
			totalScore += char.Score
		}
	}
	g.Score.TotalScore = totalScore
	g.EndDate = time.Now()
}
