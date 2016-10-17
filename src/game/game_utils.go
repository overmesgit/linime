package game

import (
	"fmt"
	"github.com/jinzhu/gorm"
	"github.com/syndtr/goleveldb/leveldb/errors"
	"malmodel"
	"math"
	"math/rand"
	"sort"
	"strconv"
	"strings"
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

func (g *Game) getTitleMap() map[int][]GameCharPosition {
	titleMap := make(map[int][]GameCharPosition, 0)
	for _, v := range g.Field {
		if _, ok := titleMap[v.TitleId]; !ok {
			titleMap[v.TitleId] = make([]GameCharPosition, 0)
		}
		titleMap[v.TitleId] = append(titleMap[v.TitleId], v)
	}
	return titleMap
}

func (g *Game) getExistedChar(requiredForLine bool) (GameCharPosition, error) {
	var res GameCharPosition
	titleMap := g.getTitleMap()

	targetTitles := make([]int, 0)
	for key, titlesChars := range titleMap {
		if requiredForLine {
			if len(titlesChars) < g.Line {
				targetTitles = append(targetTitles, key)
			}
		} else {
			if len(titlesChars) >= g.Line && len(titlesChars) < MAX_FROM_ONE_TITLE {
				targetTitles = append(targetTitles, key)
			}
		}
	}

	if len(targetTitles) > 0 {
		selectedTitleId := targetTitles[rand.Intn(len(targetTitles))]
		existedCharacters := make([]string, 0)
		for _, char := range titleMap[selectedTitleId] {
			existedCharacters = append(existedCharacters, strconv.Itoa(char.Id))
		}

		selectedTitle := malmodel.AnimeModel{Id: selectedTitleId}
		query := gormDB.First(&selectedTitle)
		err := GetGormError(query)
		if err != nil {
			return res, errors.New(fmt.Sprintf("error: get title %v", err.Error()))
		}

		var titleCharacters []string
		for _, char := range selectedTitle.GetStoredChars() {
			titleCharacters = append(titleCharacters, strconv.Itoa(char.Id))
		}

		var characters CharModelSlice
		query = gormDB.Where("id in (?) and id not in (?)", titleCharacters, existedCharacters).Find(&characters)
		err = GetGormError(query)
		if err != nil {
			return res, errors.New(fmt.Sprintf("error: get new characters %v", err.Error()))
		}
		if len(characters) > 0 {
			randomCharacters := GetRandomCharactersByFavorites(selectedTitle, characters, 1, g.Difficulty)
			for {
				pos := g.AddCharacterToRandomPos(randomCharacters[0], selectedTitleId)
				completed, _ := g.CheckCompleted()
				if len(completed) == 0 || !g.HasFreePositions() {
					return pos, nil
				}
			}
		}
	}
	return g.getNewGroupChar()
}

func (g *Game) getNewGroupChar() (GameCharPosition, error) {
	var res GameCharPosition
	var err error
	currentTitles := make([]string, 0)
	for _, v := range g.Field {
		currentTitles = append(currentTitles, strconv.Itoa(v.TitleId))
	}

	var currentGroups []int
	if len(currentTitles) > 0 {
		query := gormDB.Table("anime_models").Where("id in (?)", currentTitles).Pluck(`"group"`, &currentGroups)
		err := GetGormError(query)
		if err != nil {
			return res, errors.New(fmt.Sprintf("error: get existed groups %v", err.Error()))
		}
	}

	currentGroups = append(currentGroups, g.Score.CompletedGroups...)
	currentGroupsStr := strings.Trim(fmt.Sprint(currentGroups), "[]")

	newGroups := make([]int, 0)
	if g.UserName != "" {
		userLimitAdd := 0
		userOffsetStep := 100 + 100*g.Difficulty*g.Difficulty
		userLimit := userOffsetStep + userLimitAdd
		previousLength := 0
		for len(newGroups) == 0 && userLimit < len(g.UserItems)+userOffsetStep {
			if userLimit > len(g.UserItems) {
				userLimit = len(g.UserItems)
			}
			userItemsStr := strings.Trim(fmt.Sprint(g.UserItems[:userLimit]), "[]")
			where := "jsonb_array_length(chars_json) > ? and group not in (?) and id in (?)"
			query := gormDB.Table("anime_models").Where(where, 2, currentGroupsStr, userItemsStr).Pluck("group", &newGroups)
			err = GetGormError(query)
			if err != nil {
				return res, errors.New(fmt.Sprintf("error: get new user groups %v", err.Error()))
			}
			if len(newGroups) < userLimit/2 && len(newGroups) != 0 && len(newGroups) != previousLength {
				previousLength = len(newGroups)
				newGroups = newGroups[:0]
				userLimit += userOffsetStep
			}
		}
	}
	var titles AnimeModelSlice
	offsetStep := 100 + 200*g.Difficulty*g.Difficulty
	if len(newGroups) == 0 {
		animeLimit := offsetStep
		var query *gorm.DB

		if len(currentGroups) > 0 {
			where := "jsonb_array_length(chars_json) > ? and 'group' not in (?)"
			query = gormDB.Where(where, 2, currentGroups)
		} else {
			where := "jsonb_array_length(chars_json) > ?"
			query = gormDB.Where(where, 2)
		}
		query = query.Order("score_count desc").Limit(animeLimit).Find(&titles)
		err = GetGormError(query)
		if err != nil {
			return res, errors.New(fmt.Sprintf("error: get new groups %v", err.Error()))
		}

	}
	for _, title := range titles {
		newGroups = append(newGroups, title.Group)
	}

	uniquerGroups := GetUniqueValues(newGroups)
	targetGroup := uniquerGroups[rand.Intn(len(uniquerGroups))]
	val, err := g.AddRandomCharacterByGroup(targetGroup, 1)
	if err != nil {
		return res, err
	}
	if len(val) == 0 {
		return res, errors.New("Get character by group error")
	}
	return val[0], nil
}

func checkLeft(pos map[int]map[int]GameCharPosition, char GameCharPosition, prevResult []GameCharPosition) []GameCharPosition {
	if leftChar, ok := pos[char.Row][char.Col-1]; ok && leftChar.TitleId == char.TitleId {
		return checkLeft(pos, leftChar, append(prevResult, leftChar))
	}
	return prevResult
}
func checkLeftTop(pos map[int]map[int]GameCharPosition, char GameCharPosition, prevResult []GameCharPosition) []GameCharPosition {
	if leftChar, ok := pos[char.Row-1][char.Col-1]; ok && leftChar.TitleId == char.TitleId {
		return checkLeftTop(pos, leftChar, append(prevResult, leftChar))
	}
	return prevResult
}
func checkTop(pos map[int]map[int]GameCharPosition, char GameCharPosition, prevResult []GameCharPosition) []GameCharPosition {
	if leftChar, ok := pos[char.Row-1][char.Col]; ok && leftChar.TitleId == char.TitleId {
		return checkTop(pos, leftChar, append(prevResult, leftChar))
	}
	return prevResult
}
func checkTopRight(pos map[int]map[int]GameCharPosition, char GameCharPosition, prevResult []GameCharPosition) []GameCharPosition {
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
	randomInt := rand.Intn(fullMembersSum)
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

func GetRandomCharactersByFavorites(title malmodel.AnimeModel, c CharModelSlice, n int, charDiff int) CharModelSlice {
	sort.Sort(sort.Reverse(c))
	fullFavoritesSum := 0
	mainCharsMap := map[int]bool{}
	for _, char := range title.GetStoredChars() {
		if char.Main {
			mainCharsMap[char.Id] = true
		}
	}
	for i := range c {
		favAdd := 0
		switch charDiff {
		case 0:
		case 1:
			if isMain, _ := mainCharsMap[c[i].Id]; isMain {
				favAdd = 10000
			}
		case 2:
			if c[i].Favorites == 0 {
				favAdd = 1
			}
		case 3:
			if c[i].Favorites == 0 {
				favAdd = 3
			}
		case 4:
			c[i].Favorites = int(math.Sqrt(float64(c[i].Favorites)))
			if c[i].Favorites == 0 {
				favAdd = 5
			}
		}
		c[i].Favorites += favAdd
		fullFavoritesSum += c[i].Favorites
	}

	resultIndexes := make(map[int]bool, 0)
	for i := 0; i < n; i++ {
		randomInt := 0
		if fullFavoritesSum > 0 {
			randomInt = rand.Intn(fullFavoritesSum)
		}

		currentSum := 0
		for charIndex, char := range c {
			currentSum += char.Favorites
			if _, ok := resultIndexes[charIndex]; currentSum >= randomInt && !ok {
				resultIndexes[charIndex] = true
				break
			}
		}
	}

	result := make(CharModelSlice, 0)
	for index := range resultIndexes {
		result = append(result, c[index])
	}
	return result
}
