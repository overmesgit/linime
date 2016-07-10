window.ReactCSSTransitionGroup = React.ReactCSSTransitionGroup;

class Character extends React.Component {
    selectChar() {
        this.props.selectChar(this.props.char);
    }

    render() {
        const {gameTurn} = this.props;
        const {Img, Row, Col, prevRow, prevCol, selected, toDelete, turn} = this.props.char;
        var classes = ["char-cell", "row"+Row, "col"+Col,
            (selected ? "selected":""), (toDelete?"cell-remove":""),
            (turn == gameTurn - 1 ? "new":""), (turn == gameTurn ? "appear":"")];
        return <div className={classes.join(" ")}
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

class CompleteTitle extends React.Component {
    render() {
        const {title} = this.props;
        var charsNodes = title.Characters.map((charStat, i) => {
            return <p key={i} className="stat-char">
                <span className="stat-char-score">{(charStat.Score > 0 ? "+":"")}{charStat.Score}</span>
                <img src={charStat.Img} className="stat-char-img" />
                <a target="_blank" className="stat-char-name" href={"http://myanimelist.net/character/" + charStat.Id}>{charStat.Name}</a>
            </p>
        });
        const lowerTitle = title.Title.toLowerCase();
        const lowerEnglish = title.English.toLowerCase();
        var isEnglishNeeded = title.English && lowerTitle.search(lowerEnglish) == -1 && lowerTitle != lowerEnglish;
        return <div id="title-scores">
            <p className="score-title-turn">turn: {title.Turn}</p>
            <a target="_blank" className="score-title-name" href={"http://myanimelist.net/anime/" + title.Id}>
                {title.Title} {isEnglishNeeded ? "(" + title.English + ")":""}</a>
            {charsNodes}
        </div>
    }
}

class GameScore extends React.Component {
    componentDidMount() {
        $('#game-scores').perfectScrollbar();
    }

    getTotalScore() {
        const {completedTitles} = this.props;
        var totalScore = 0;
        completedTitles.forEach((title) => {
            title.Characters.forEach((char) => {
                totalScore += char.Score;
            })
        });
        return totalScore;
    }
    render() {
        const {completedTitles, currentTurn} = this.props;

        var titlesNodes = completedTitles.map((title, i) => {
            return <CompleteTitle key={i} title={title} />
        });
        //last titles in the end of the list
        titlesNodes.reverse();
        return <div id="game-scores">
            <p>Turn: {currentTurn}</p>
            <p>Total score: {this.getTotalScore()}</p>
            {titlesNodes}
        </div>
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
                              selectChar={selectChar} gameTurn={game.Turn} />
        });

        return <div id="game" className="content">
                {fieldCell}
                {characters}
                <GameScore completedTitles={game.Score.CompletedTitles} currentTurn={game.Turn} />
            </div>
    }
}

window.Game = Game;