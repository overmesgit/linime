class Character extends React.Component {
    selectChar() {
        this.props.selectChar(this.props.char);
    }

    shouldComponentUpdate(nextProps, nextState) {
        var checkList = ['Img', 'Row', 'Col', 'prevRow', 'prevCol', 'selected', 'toDelete', 'turn', 'advice'];
        for(var i = 0; i < checkList.length; i++){
            if (this.props.char[checkList[i]] != nextProps.char[checkList[i]]) {
                return true;
            }
        }
        return this.props.gameTurn != nextProps.gameTurn;
    }

    render() {
        const {gameTurn} = this.props;
        const {Img, Row, Col, prevRow, prevCol, selected, toDelete, turn, advice} = this.props.char;
        var classes = ["char-cell", "row"+Row, "col"+Col, (advice ? "advice":""),
            (selected ? "selected":""), (toDelete?"cell-remove":""),
            (turn == gameTurn - 1 ? "new":""), (turn == gameTurn ? "appear":"")];
        return <div className={classes.join(" ")}
                 onClick={this.selectChar.bind(this)}>
                <img src={Img} className="char" />
            </div>
    }
}

class FieldCell extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }
    moveSelected() {
        var char = this.props.game.Field.find((char) => {
            if (char.selected) {
                return char
            }
        });
        if (char) {
            this.props.moveSelected(this.props.game.Id, char, this.props.row, this.props.col);
        }
    }

    render() {
        const {row, col, game} = this.props;
        var fieldClasses = ["fieldCell"];
        if (row == 0) {
            fieldClasses.push('topRow')
        }
        if (row == game.Width - 1) {
            fieldClasses.push('bottomRow')
        }
        if (col == 0) {
            fieldClasses.push('leftCol')
        }
        if (col == game.Height - 1) {
            fieldClasses.push('rightCol')
        }
        return <div onClick={this.moveSelected.bind(this)} className={ fieldClasses.join(' ') }></div>
    }
}

class Game extends React.Component {
    render() {
        const {game, selectChar, moveSelected, tutorialState, endTutorial, nextTutorial} = this.props;
        var fieldCell = [];
        for (var row = 0; row < game.Width; row++) {
            for (var col = 0; col < game.Height; col++) {
                fieldCell.push(<FieldCell key={'' + row + col} row={row} col={col}
                                          game={game} moveSelected={moveSelected}>
                </FieldCell>)
            }
        }
        var characters = game.Field.map((charData, i) => {
            return <Character key={charData.Img.slice(-8, -4) + charData.Col + charData.Row} char={charData}
                              selectChar={selectChar} gameTurn={game.Turn} />
        });

        return <div id="game" className="window">
                <Tutorial state={tutorialState} endTutorial={endTutorial} nextTutorial={nextTutorial} />
                {fieldCell}
                {characters}
            </div>
    }
}