package game

import (
	"github.com/syndtr/goleveldb/leveldb/errors"
	"gopkg.in/mgo.v2/bson"
	"mal/parser"
	"math"
	"math/rand"
	"sort"
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
		existedCharacters := make([]int, 0)
		for _, char := range titleMap[selectedTitleId] {
			existedCharacters = append(existedCharacters, char.Id)
		}
		char := mongoDB.C("char")
		anime := mongoDB.C("anime")
		notEmpty := bson.M{"$not": bson.M{"$size": 0}}

		var titleCharacters []int
		err := anime.Find(bson.M{"characters": notEmpty, "_id.i": selectedTitleId}).Distinct("characters", &titleCharacters)
		if err != nil {
			return res, err
		}
		var characters parser.CharacterSlice
		err = char.Find(bson.M{"$and": []interface{}{
			bson.M{"_id": bson.M{"$in": titleCharacters}},
			bson.M{"_id": bson.M{"$nin": existedCharacters}},
		}}).All(&characters)
		if err != nil {
			return res, err
		}
		if len(characters) > 0 {
			randomCharacters := GetRandomCharactersByFavorites(selectedTitleId, characters, 1, g.Difficulty)
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
	currentTitles := make([]int, 0)
	for _, v := range g.Field {
		currentTitles = append(currentTitles, v.TitleId)
	}

	anime := mongoDB.C("anime")
	exists := bson.M{"$exists": true}
	var currentGroups []int
	err := anime.Find(bson.M{"characters.2": exists, "_id.i": bson.M{"$in": currentTitles}}).Distinct("group", &currentGroups)
	if err != nil {
		return res, err
	}

	currentGroups = append(currentGroups, g.Score.CompletedGroups...)

	newGroups := make([]int, 0)
	if g.UserName != "" {
		err = anime.Find(bson.M{"characters.2": exists, "group": bson.M{"$nin": currentGroups}, "_id.i": bson.M{"$in": g.UserItems}}).Distinct("group", &newGroups)
		if err != nil {
			return res, err
		}
	}
	var titles []parser.Title
	limitAdd := 0
	for len(titles) == 0 && len(newGroups) == 0 {
		animeLimit := 100 + 100*g.Difficulty*g.Difficulty + limitAdd
		scoreFilter := 8 - g.Difficulty

		err = anime.Find(bson.M{"characters.2": exists, "group": bson.M{"$nin": currentGroups},
			"members_score": bson.M{"$gte": scoreFilter}}).Sort("-members").Limit(animeLimit).All(&titles)
		if err != nil {
			return res, err
		}
		if len(titles) == 0 {
			limitAdd += 100
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

func GetRandomCharactersByFavorites(titleId int, c parser.CharacterSlice, n int, charDiff int) parser.CharacterSlice {
	sort.Sort(sort.Reverse(c))
	fullFavoritesSum := 0
	for i := range c {
		favAdd := 0
		switch charDiff {
		case 0:
		case 1:
			if c[i].IsMain(titleId) {
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

	result := make(parser.CharacterSlice, 0)
	for index := range resultIndexes {
		result = append(result, c[index])
	}
	return result
}
