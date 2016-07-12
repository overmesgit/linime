class Menu extends React.Component {
    createGame(e) {
        this.props.createGame();
    }

    completeGame(e) {
        this.props.completeGame(this.props.game.Id);
    }

    render() {
        const {myGames, getGame, game} = this.props;

        var gamesNodes = myGames.map((gameId, i) => {
            return <p key={i} className="my-game btn" onClick={getGame.bind(this, gameId)}>{gameId}</p>
        });

        var completeNode = "";
        if(game.Score.TotalScore == -1) {
            completeNode = <h2 className="menu-content-button btn" onClick={this.completeGame.bind(this)}>Complete game</h2>
        }
        return <div id="menu" className="window">
            <div className="menu-content">
                <h1>Anime Lines</h1>
                <h3>Line them all!</h3>
                <h2 className="menu-content-button btn" onClick={this.createGame.bind(this)}>New game</h2>
                {completeNode}
                <div className="my-games-list">
                    <h3>My games:</h3>
                    {gamesNodes}
                </div>
            </div>
        </div>
    }
}

window.Menu = Menu;