package game

import (
	"fmt"
	"malmodel"
	"math"
	"math/rand"
	"sort"
	"errors"
)

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

func (g *Game) getFullAndRequiredCount() (float64, float64) {
	titleMap := g.getTitleMap()
	full, required := 0.0, 0.0
	for _, val := range titleMap {
		if len(val) >= g.Line {
			full++
		} else {
			required++
		}
	}
	return full, required
}

func (g *Game) getTitleMap() map[int]GameCharPositionSlice {
	titleMap := make(map[int]GameCharPositionSlice, 0)
	for _, v := range g.Field {
		if _, ok := titleMap[v.TitleId]; !ok {
			titleMap[v.TitleId] = make(GameCharPositionSlice, 0)
		}
		titleMap[v.TitleId] = append(titleMap[v.TitleId], v)
	}
	return titleMap
}

func (g *Game) addExistedChar(requiredForLine bool) (GameCharPosition, error) {
	logger.Printf("add existed title character, required for line %v\n", requiredForLine)
	var res GameCharPosition

	nextTitles := make([]int, 0)
	if requiredForLine {
		nextTitles = g.GetLessLineTitles()
	} else {
		nextTitles = g.GetMoreLineTitles()
	}

	logger.Printf("existed titles %v\n", nextTitles)
	if len(nextTitles) > 0 {
		nextTitleId := nextTitles[rand.Intn(len(nextTitles))]

		selectedTitle := malmodel.AnimeModel{Id: nextTitleId}
		query := gormDB.First(&selectedTitle)
		if err := GetGormError(query); err != nil {
			logger.Println(err.Error())
			return res, errors.New(fmt.Sprintf("error: get title %v", err.Error()))
		}

		animeChars := selectedTitle.GetStoredChars()
		titleCharacters := animeChars.GetIds()
		titleMap := g.getTitleMap()
		usedCharacters := titleMap[nextTitleId].GetIds()

		var characters CharModelSlice
		query = gormDB.Where("id in (?) and id not in (?)", titleCharacters, usedCharacters).Find(&characters)
		if err := GetGormError(query); err != nil {
			return res, errors.New(fmt.Sprintf("error: get new characters %v", err.Error()))
		}
		if len(characters) > 0 {
			randomCharacters := characters.GetRandomByFavorites(animeChars.GetMainCharsMap(), 1, g.Difficulty)
			pos := g.AddCharacterToRandomPos(randomCharacters[0], nextTitleId)
			return pos, nil
		}
	}
	return g.addNewGroupChar()
}

func (g *Game) GetUserGroups(filteredGroups []int) ([]int, error) {
	res := make([]int, 0)
	userLimitAdd := 0
	userOffsetStep := 100 + 100*g.Difficulty*g.Difficulty
	userLimit := userOffsetStep + userLimitAdd
	previousLength := 0
	for len(res) == 0 && userLimit < len(g.UserItems)+userOffsetStep {
		if userLimit > len(g.UserItems) {
			userLimit = len(g.UserItems)
		}
		where := "jsonb_array_length(chars_json) > ? and id in (?)"
		query := gormDB.Table("anime_models").Where(where, 2, g.UserItems[:userLimit])
		if len(filteredGroups) > 0 {
			query = query.Where("group_id not in (?)", filteredGroups).Pluck("group_id", &res)
		}
		if err := GetGormError(query); err != nil {
			return res, errors.New(fmt.Sprintf("error: get new user groups %v", err.Error()))
		}
		if len(res) < userLimit/2 && len(res) != 0 && len(res) != previousLength {
			previousLength = len(res)
			res = res[:0]
			userLimit += userOffsetStep
		}
	}
	return res, nil
}

func (g *Game) addNewGroupChar() (GameCharPosition, error) {
	logger.Println("add new character")
	var res GameCharPosition
	var err error
	currentTitles := g.Field.GetTitlesIds()

	var usedGroups []int
	if len(currentTitles) > 0 {
		query := gormDB.Table("anime_models").Where("id in (?)", currentTitles).Pluck("group_id", &usedGroups)
		if err := GetGormError(query); err != nil {
			return res, errors.New(fmt.Sprintf("error: get existed groups %v", err.Error()))
		}
	}

	usedGroups = append(usedGroups, g.Score.CompletedGroups...)
	var notUsedGroups []int
	if len(g.UserItems) > 0 {
		notUsedGroups, err = g.GetUserGroups(usedGroups)
		if err != nil {
			return res, err
		}
	}

	// not found user groups
	if len(notUsedGroups) == 0 {
		animeLimit := 100 + 200*g.Difficulty*g.Difficulty
		query := gormDB.Where("jsonb_array_length(chars_json) > ?", 2)
		if len(usedGroups) > 0 {
			query = gormDB.Where("group_id not in (?)", usedGroups)
		}
		query = query.Table("anime_models").Order("score_count desc").Limit(animeLimit).Pluck("group_id", &notUsedGroups)
		if err = GetGormError(query); err != nil {
			return res, errors.New(fmt.Sprintf("error: get new groups %v", err.Error()))
		}
	}
	if len(notUsedGroups) == 0 {
		return res, nil
	}
	uniquerGroups := GetUniqueValues(notUsedGroups)
	logger.Printf("not used groups %v\n", uniquerGroups)
	randomGroupId := uniquerGroups[rand.Intn(len(uniquerGroups))]
	val, err := g.AddRandomCharacterByGroup(randomGroupId, 1)
	if err != nil {
		return res, err
	}
	if len(val) == 0 {
		return res, errors.New("Get character by group error")
	}
	return val[0], nil
}

func checkLeft(pos map[int]map[int]GameCharPosition, char GameCharPosition, prevResult GameCharPositionSlice) GameCharPositionSlice {
	if leftChar, ok := pos[char.Row][char.Col-1]; ok && leftChar.TitleId == char.TitleId {
		return checkLeft(pos, leftChar, append(prevResult, leftChar))
	}
	return prevResult
}
func checkLeftTop(pos map[int]map[int]GameCharPosition, char GameCharPosition, prevResult GameCharPositionSlice) GameCharPositionSlice {
	if leftChar, ok := pos[char.Row-1][char.Col-1]; ok && leftChar.TitleId == char.TitleId {
		return checkLeftTop(pos, leftChar, append(prevResult, leftChar))
	}
	return prevResult
}
func checkTop(pos map[int]map[int]GameCharPosition, char GameCharPosition, prevResult GameCharPositionSlice) GameCharPositionSlice {
	if leftChar, ok := pos[char.Row-1][char.Col]; ok && leftChar.TitleId == char.TitleId {
		return checkTop(pos, leftChar, append(prevResult, leftChar))
	}
	return prevResult
}
func checkTopRight(pos map[int]map[int]GameCharPosition, char GameCharPosition, prevResult GameCharPositionSlice) GameCharPositionSlice {
	if leftChar, ok := pos[char.Row-1][char.Col+1]; ok && leftChar.TitleId == char.TitleId {
		return checkTopRight(pos, leftChar, append(prevResult, leftChar))
	}
	return prevResult
}

func (g *Game) ShuffleField() {
	for i := range g.Field {
		j := rand.Intn(i + 1)
		g.Field[i], g.Field[j] = g.Field[j], g.Field[i]
	}
}

func (g *Game) initRandomPositions() {
	if g.positions == nil {
		g.positions = g.GetAllFreePositions()
		g.randomPos = rand.Perm(len(g.positions))
	}
}

func (g *Game) GetRandomPositions() (int, int) {
	g.initRandomPositions()
	res := g.positions[g.randomPos[g.currentRandomPos]]
	g.currentRandomPos++
	return res[0], res[1]
}

func (g *Game) HasFreePositions() bool {
	g.initRandomPositions()
	if g.currentRandomPos < len(g.positions) {
		return true
	}
	return false
}

func (g *Game) GetAllFreePositions() [][2]int {
	result := make([][2]int, 0)
	isFieldFree := g.getFieldFreeFactory()
	for i := 0; i < g.Height; i++ {
		for j := 0; j < g.Width; j++ {
			if isFieldFree(i, j) {
				result = append(result, [2]int{i, j})
			}
		}
	}
	return result
}

type AnimeModelSlice []malmodel.AnimeModel

func (a AnimeModelSlice) GetIds() []int {
	res := make([]int, 0)
	for _, model := range a {
		res = append(res, model.Id)
	}
	return res
}

func (a AnimeModelSlice) Len() int {
	return len(a)
}

func (a AnimeModelSlice) Swap(i, j int) {
	a[i], a[j] = a[j], a[i]
}

func (a AnimeModelSlice) Less(i, j int) bool {
	return a[i].ScoreCount < a[j].ScoreCount
}

func (a AnimeModelSlice) GetRandomByMembers() malmodel.AnimeModel {
	sort.Sort(sort.Reverse(a))
	fullMembersSum := 0
	for _, a := range a {
		fullMembersSum += a.ScoreCount
	}
	randomInt := rand.Intn(fullMembersSum + 1)
	currentSum := 0
	for _, a := range a {
		currentSum += a.ScoreCount
		if currentSum >= randomInt {
			return a
		}
	}
	return a[len(a)-1]
}

type CharModelSlice []malmodel.CharacterModel

func (c CharModelSlice) GetIds() []int {
	result := make([]int, len(c))
	for i, v := range c {
		result[i] = v.Id
	}
	return result
}

func (c CharModelSlice) Len() int {
	return len(c)
}

func (c CharModelSlice) Swap(i, j int) {
	c[i], c[j] = c[j], c[i]
}

func (c CharModelSlice) Less(i, j int) bool {
	return c[i].Favorites < c[j].Favorites
}

func (chars CharModelSlice) PrepareFavoritesByDifficulty(animeMainCharsMap map[int]bool, diff int) int {
	fullFavoritesSum := 0
	for i := range chars {
		favAdd := 0
		switch diff {
		case 0, 1:
			if isMain, _ := animeMainCharsMap[chars[i].Id]; isMain {
				favAdd = 10000
			}
		case 2:
			if chars[i].Favorites == 0 {
				favAdd = 1
			}
		case 3:
			if chars[i].Favorites == 0 {
				favAdd = 3
			}
		case 4:
			chars[i].Favorites = int(math.Sqrt(float64(chars[i].Favorites)))
			if chars[i].Favorites == 0 {
				favAdd = 5
			}
		}
		chars[i].Favorites += favAdd
		fullFavoritesSum += chars[i].Favorites
	}
	return fullFavoritesSum

}

func (chars CharModelSlice) GetRandomByFavorites(animeMainCharsMap map[int]bool, n int, diff int) CharModelSlice {
	sort.Sort(sort.Reverse(chars))
	fullFavoritesSum := chars.PrepareFavoritesByDifficulty(animeMainCharsMap, diff)

	resultIndexes := make(map[int]bool, 0)
	for i := 0; i < n && i < len(chars); i++ {
		randomInt := rand.Intn(fullFavoritesSum + 1)

		currentSum := 0
		for charIndex, char := range chars {
			currentSum += char.Favorites
			if _, ok := resultIndexes[charIndex]; currentSum >= randomInt && !ok {
				resultIndexes[charIndex] = true
				break
			}
		}
	}

	result := make(CharModelSlice, 0)
	for index := range resultIndexes {
		result = append(result, chars[index])
	}
	return result
}
