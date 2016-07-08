class Character extends React.Component {
    selectChar() {
        this.props.selectChar(this.props.char);
    }

    render() {
        var cellWidth = 100;
        var cellHeight = 100;
        const {Img, Row, Col} = this.props.char;
        const {selectedChar} = this.props;
        var selected = false;
        if (selectedChar && selectedChar.Row == Row && selectedChar.Col == Col) {
            selected = true;
        }
        return <div className={"char-cell " + (selected ? "selected":"")}
                    style={{ left: cellWidth*Col, top: cellHeight*Row}}
                    onClick={this.selectChar.bind(this)}>
                <div className="char" style={{ backgroundImage: 'url(' + Img + ')'}}></div>
            </div>
    }
}

class Game extends React.Component {
    render() {
        const {game, selectedChar, selectChar} = this.props;
        console.log(selectChar)
        var fieldCell = [];
        for(var i = 0; i < game.Width; i++) {
            for(var j = 0; j < game.Height; j++) {
                var fieldClasses = ["fieldCell"];
                if (i == 0) {
                    fieldClasses.push('topRow')
                }
                if (i == game.Width - 1) {
                    fieldClasses.push('bottomRow')
                }
                if (j == 0) {
                    fieldClasses.push('leftCol')
                }
                if (j == game.Height - 1) {
                    fieldClasses.push('rightCol')
                }
                fieldCell.push(<div key={'' + i + j} className={ fieldClasses.join(' ') }></div>)
            }
        }
        var characters = game.Field.map((charData) => {
            return <Character key={'' + charData.Col + charData.Row} char={charData}
                               selectedChar={selectedChar} selectChar={selectChar} />
        });

        return <div id="game" className="content">
            {fieldCell}
            {characters}
        </div>
    }
}

window.Game = Game;