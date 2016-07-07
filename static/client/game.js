class Character extends React.Component {
    render() {
        var cellWidth = 100;
        var cellHeight = 100;
        const {CharId, Row, Col} = this.props.char;
        var img = '/static/char/' + CharId + '.jpg';
        return <div className="char"
                    style={{ left: cellWidth*Col, top: cellHeight*Row, backgroundImage: 'url(' + img + ')'}}></div>
    }
}

class Game extends React.Component {
    render() {
        const game = this.props.game;

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
            return <Character key={charData.CharId} char={charData} />
        });

        return <div id="game" className="content">
            {fieldCell}
            {characters}
        </div>
    }
}

window.Game = Game;