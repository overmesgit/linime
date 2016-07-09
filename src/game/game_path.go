package game

type PathField struct {
	FromRow int
	FromCol int
	open    bool
}

func (g *Game) isFieldFree(row, col int) bool {
	for i := range g.Field {
		if g.Field[i].Row == row && g.Field[i].Col == col {
			return false
		}
	}
	return true

}

func (g *Game) makeMove(fields [][]PathField, nextOpenedFields [][2]int) [][2]int {
	result := make([][2]int, 0)
	for _, next := range nextOpenedFields {
		nextRow, nextCol := next[0], next[1]
		//left
		if nextCol > 0 && !fields[nextRow][nextCol-1].open && g.isFieldFree(nextRow, nextCol-1) {
			result = append(result, [2]int{nextRow, nextCol - 1})
			fields[nextRow][nextCol-1] = PathField{nextRow, nextCol, true}
		}
		//right
		if nextCol < g.Width-1 && !fields[nextRow][nextCol+1].open && g.isFieldFree(nextRow, nextCol+1) {
			result = append(result, [2]int{nextRow, nextCol + 1})
			fields[nextRow][nextCol+1] = PathField{nextRow, nextCol, true}
		}
		//top
		if nextRow > 0 && !fields[nextRow-1][nextCol].open && g.isFieldFree(nextRow-1, nextCol) {
			result = append(result, [2]int{nextRow - 1, nextCol})
			fields[nextRow-1][nextCol] = PathField{nextRow, nextCol, true}
		}
		//bottom
		if nextRow < g.Height-1 && !fields[nextRow+1][nextCol].open && g.isFieldFree(nextRow+1, nextCol) {
			result = append(result, [2]int{nextRow + 1, nextCol})
			fields[nextRow+1][nextCol] = PathField{nextRow, nextCol, true}
		}
	}

	return result
}

func (g *Game) FindPath(fromRow, fromCol, toRow, toCol int) [][2]int {
	fields := make([][]PathField, g.Height)
	for i := 0; i < g.Height; i++ {
		fields[i] = make([]PathField, g.Width)
	}
	fields[fromRow][fromCol] = PathField{fromRow, fromCol, true}

	pathFields := make([][2]int, 0)
	pathFields = append(pathFields, [2]int{fromRow, fromCol})
	var lastField PathField
	pathFound := false
	for len(pathFields) > 0 && !pathFound {
		pathFields = g.makeMove(fields, pathFields)
		for i := range pathFields {
			if pathFields[i][0] == toRow && pathFields[i][1] == toCol {
				lastField = fields[toRow][toCol]
				pathFound = true
			}
		}
	}

	result := make([][2]int, 0)
	if pathFound {
		result = append(result, [2]int{toRow, toCol})
		for {
			result = append(result, [2]int{lastField.FromRow, lastField.FromCol})
			lastField = fields[lastField.FromRow][lastField.FromCol]
			if lastField.FromRow == fromRow && lastField.FromCol == fromCol {
				break
			}
		}
	}

	return result

}
