package game

import (
	"mal/parser"
	"math"
	"math/rand"
	"sort"
)

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

func GetRandomCharactersByFavorites(c parser.CharacterSlice, n int) parser.CharacterSlice {
	sort.Sort(sort.Reverse(c))
	fullFavoritesSum := 0
	for i := range c {
		//WARNING: not line function
		c[i].Favorites = int(math.Sqrt(float64(c[i].Favorites)))
		if c[i].Favorites == 0 {
			c[i].Favorites = 1
		}
		fullFavoritesSum += c[i].Favorites
	}

	resultIndexes := make(map[int]bool, 0)
	for i := 0; i < n; i++ {
		randomInt := rand.Intn(fullFavoritesSum)
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
	for index, _ := range resultIndexes {
		result = append(result, c[index])
	}
	return result
}
