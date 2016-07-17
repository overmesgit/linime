package game

import (
	"gopkg.in/mgo.v2/bson"
	"mal/parser"
	"math"
	"math/rand"
	"sort"
)

func (g *Game) getExistedChar(required bool) (GameCharPosition, error) {
	var res GameCharPosition
	titleMap := make(map[int][]GameCharPosition, 0)
	for _, v := range g.Field {
		if _, ok := titleMap[v.TitleId]; !ok {
			titleMap[v.TitleId] = make([]GameCharPosition, 0)
		}
		titleMap[v.TitleId] = append(titleMap[v.TitleId], v)
	}

	targetTitles := make([]int, 0)
	for key, titles := range titleMap {
		if required {
			if len(titles) < g.Line {
				targetTitles = append(targetTitles, key)
			}
		} else {
			if len(titles) >= g.Line {
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
			randomCharacters := GetRandomCharactersByFavorites(characters, 1, g.CharDiff)
			return g.AddCharacterToRandomPos(randomCharacters[0], selectedTitleId), nil
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

	newGroups := make([]int, 0)
	if g.UserName != "" {
		err = anime.Find(bson.M{"characters.2": exists, "group": bson.M{"$nin": currentGroups}, "_id.i": bson.M{"$in": g.UserItems}}).Distinct("group", &newGroups)
		if err != nil {
			return res, err
		}
	}
	if len(newGroups) == 0 {
		animeLimit := 500 + 500*g.AnimeDiff*g.AnimeDiff
		scoreFilter := 8 - g.AnimeDiff
		var titles []parser.Title
		err = anime.Find(bson.M{"characters.2": exists, "group": bson.M{"$nin": currentGroups},
			"members_score": bson.M{"$gte": scoreFilter}}).Sort("-members").Limit(animeLimit).All(&titles)
		if err != nil {
			return res, err
		}
		for _, title := range titles {
			newGroups = append(newGroups, title.Group)
		}
	}

	uniquerGroups := GetUniqueValues(newGroups)
	targetGroup := uniquerGroups[rand.Intn(len(uniquerGroups))]
	val, err := g.AddRandomCharacterByGroup(targetGroup, 1)
	if err != nil {
		return res, err
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

func (g *Game) GetRandomPositions() (int, int) {
	if g.positions == nil {
		g.positions = g.GetAllFreePositions()
		g.randomPos = rand.Perm(len(g.positions))
	}
	res := g.positions[g.randomPos[g.currentRandomPos]]
	g.currentRandomPos++
	return res[0], res[1]
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

func GetRandomCharactersByFavorites(c parser.CharacterSlice, n int, charDiff int) parser.CharacterSlice {
	sort.Sort(sort.Reverse(c))
	fullFavoritesSum := 0
	for i := range c {
		switch charDiff {
		case 0:
		case 1:
			c[i].Favorites = int(math.Sqrt(float64(c[i].Favorites)))
			if c[i].Favorites == 0 {
				c[i].Favorites = 1
			}
		case 2:
			c[i].Favorites = int(math.Sqrt(float64(c[i].Favorites)))
			if c[i].Favorites == 0 {
				c[i].Favorites = 3
			}
		}
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
