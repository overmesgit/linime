package game

import (
	"mal/parser"
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
		g.positions = GetAllPositions(g.Width, g.Height)
		g.randomPos = rand.Perm(g.Width * g.Height)
	}
	res := g.positions[g.randomPos[g.currentRandomPos]]
	g.currentRandomPos++
	return res[0], res[1]
}

func GetAllPositions(row, col int) [][2]int {
	result := make([][2]int, row*col)
	for i := 0; i < row; i++ {
		for j := 0; j < col; j++ {
			result[i*col+j] = [2]int{i, j}
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
	for _, a := range c {
		fullFavoritesSum += a.Favorites
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
