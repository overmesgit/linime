window.ReactCSSTransitionGroup = React.ReactCSSTransitionGroup;

class Character extends React.Component {
    constructor() {
        super();
        this.cellWidth = 100;
        this.cellHeight = 100;
    }

    selectChar() {
        this.props.selectChar(this.props.char);
    }

    render() {
        const {Img, Row, Col, prevRow, prevCol, selected, toDelete, newChar} = this.props.char;
        var classes = "char-cell " + (selected ? "selected":"") + " " + (toDelete?"cell-remove":"");
        classes += " " + (newChar ? "new":"");
        return <div className={classes}
                 style={{ top: this.cellHeight*Row, left: this.cellWidth*Col}}
                 onClick={this.selectChar.bind(this)}>
                <img src={Img} className="char" />
            </div>
    }
}

class FieldCell extends React.Component {
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
        const {game, selectChar, moveSelected} = this.props;
        var fieldCell = [];
        for (var row = 0; row < game.Width; row++) {
            for (var col = 0; col < game.Height; col++) {
                fieldCell.push(<FieldCell key={'' + row + col} row={row} col={col}
                                          game={game} moveSelected={moveSelected}>
                </FieldCell>)
            }
        }
        var characters = game.Field.map((charData) => {
            return <Character key={charData.Img.slice(-8, -4) + charData.Col + charData.Row} char={charData}
                              selectChar={selectChar}/>
        });

        return <div id="game" className="content">
            {fieldCell}
            {characters}
        </div>
    }
}

window.Game = Game;