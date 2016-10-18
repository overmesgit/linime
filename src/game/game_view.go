package game

import (
	"errors"
	"fmt"
	"malmodel"
)

func CreateNewGame(gameParam CreateGameParam) (*Game, error) {
	logger.Println("create new game")

	game := NewGameWithParam(gameParam)
	err := game.AddUserScores()
	if err != nil {
		return game, err
	}

	for i := 0; i < 3; i++ {
		_, err := game.AddNewChars()
		if err != nil {
			return game, err
		}
	}

	return game, nil
}

func (g *Game) GetAdvice() (Advice, error) {
	var res Advice
	titlesMap := g.getTitleMap()
	var adviceTitle int

outer:
	for titleId, positions := range titlesMap {
		if len(positions) < 2 {
			continue
		}
		for _, advice := range g.Score.Advices {
			if advice.Title == titleId {
				continue outer
			}
		}
		adviceTitle = titleId
		break

	}

	viewedAdvice := false
	if adviceTitle == 0 && len(g.Score.Advices) > 0 {
		for i, advice := range g.Score.Advices {
			if _, ok := titlesMap[advice.Title]; ok {
				adviceTitle = g.Score.Advices[i].Title
				g.Score.Advices = append(g.Score.Advices[:i], g.Score.Advices[i+1:]...)
				viewedAdvice = true
				break
			}
		}
	}

	if adviceTitle != 0 {
		positions, _ := titlesMap[adviceTitle]
		images := make([]string, 0)
		for _, pos := range positions {
			images = append(images, pos.Img)
		}
		score := -3
		if g.isCompleted() || viewedAdvice || g.Difficulty == 0 {
			score = 0
		}
		res = Advice{Img: images, Title: adviceTitle, Turn: g.Turn, Score: score}
		g.Score.Advices = append(g.Score.Advices, res)
	} else {
		return res, errors.New("Can't find advice")
	}

	return res, nil
}

func (g *Game) ChangeImage(character GameCharPosition) (ChangedImage, error) {
	var result ChangedImage
	gameChar, err := g.FindChar(character.Row, character.Col)
	if err != nil {
		return result, err
	}

	sameChange := false
	for _, change := range g.Score.ChangeImgs {
		if change.OldImg == gameChar.Img {
			sameChange = true
			break
		}
	}

	char := malmodel.CharacterModel{Id: gameChar.Id}
	query := gormDB.First(&char)
	err = GetGormError(query)
	if err != nil {
		return result, errors.New(fmt.Sprintf("error: get char %v", err.Error()))
	}
	images := char.GetImages()
	if len(images) == 1 {
		return result, errors.New("Only one image")
	}
	for i, img := range images {
		if img == gameChar.Img {
			nextImage := images[(i+1)%len(images)]
			gameChar.Img = nextImage

			result = ChangedImage{OldImg: character.Img, NewImg: nextImage, Turn: g.Turn, Score: 0}
			if !sameChange {
				if g.Difficulty > 0 && !g.isCompleted() {
					result.Score = -1
				}
				g.Score.ChangeImgs = append(g.Score.ChangeImgs, result)
			}
			return result, nil
		}
	}
	return result, errors.New("No image for change")
}

func (g *Game) MakeTurn(char GameCharPosition, row, col int) (MoveResponse, error) {
	logger.Printf("make turn from (%v,%v) to (%v,%v)\n", char.Row, char.Col, row, col)
	var res MoveResponse
	path, err := g.MoveCharacter(char, row, col)
	if err != nil {
		return res, err
	} else {
		completed, notInLine := g.CheckCompleted()
		titleScoreUpdate, err := g.UpdateGameScore(completed, notInLine)
		if err != nil {
			return res, err
		}
		newChars, err := g.AddNewChars()
		if err != nil {
			return res, err
		}
		if len(g.Field) >= g.Width*g.Height {
			g.CompleteCountTotalScore()
		}
		if g.isCompleted() {
			// delete user list, it can be huge
			g.UserItems = make([]int, 0)
		}

		completedIndexes := make([][2]int, 0)
		for _, char := range append(completed, notInLine...) {
			completedIndexes = append(completedIndexes, [2]int{char.Row, char.Col})
		}
		return MoveResponse{path, completedIndexes, newChars.GetHidden(), g.Turn, titleScoreUpdate}, nil
	}
}
