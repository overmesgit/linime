class Game extends React.Component {
    createGame(e) {
        this.props.createGame();
    }

    render() {
        const game = this.props.game;

        var body = [];
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
                body.push(<div key={'' + i + j} className={ fieldClasses.join(' ') }></div>)
            }
        }

        return <div id="game" className="content">
            {body}
        </div>
    }
}

window.Game = Game;