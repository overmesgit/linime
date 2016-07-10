package game

type CompletedChar struct {
	Id    int
	Name  string
	Img   string
	Score int
}

type CompleteTitle struct {
	Id         int
	Name       string
	Turn       int
	Characters []CompletedChar
}

type GameScore struct {
	CompletedTitles []CompleteTitle
	CompletedGroups []int
}

func (g *Game) UpdateGameScore(completedChars []GameCharPosition, notInLine []GameCharPosition) GameScore {
	var res GameScore
	return res
}
