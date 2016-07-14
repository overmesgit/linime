class Menu extends React.Component {
    createGame(e) {
        this.props.createGame();
    }

    completeGame(e) {
        this.props.completeGame(this.props.game.Id);
    }

    changeCharDifficulty(e) {
        console.log(e, e.target.value)
    }

    changeAnimeDifficulty(e) {
        console.log(e, e.target.value)
    }

    render() {
        const {myGames, getGame, game, createGameStatus, toggleCreateGame} = this.props;

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
                <div className="game-control">
                    <h2 className="menu-content-button btn" onClick={toggleCreateGame}>New game</h2>
                    <div className={"difficulty" + (createGameStatus.hidden ? " difficulty-hidden": "")}>
                        <p>Character Popularity:</p>
                        <select className="select-style" onChange={this.changeCharDifficulty} value={createGameStatus.CharDifficulty}>
                            <option value="0">Easy</option>
                            <option value="1">Normal</option>
                            <option value="2">Hard</option>
                        </select>
                        <p>Anime popularity:</p>
                        <select className="select-style" onChange={this.changeAnimeDifficulty} value={createGameStatus.AnimeDifficulty}>
                            <option value="0">Easy</option>
                            <option value="1">Normal</option>
                            <option value="2">Hard</option>
                        </select>
                        <div className="btn create-game" onClick={this.createGame.bind(this)}>Create Game</div>
                    </div>
                    {completeNode}
                </div>
                <div className="my-games-list">
                    <h3>My games:</h3>
                    {gamesNodes}
                </div>
            </div>
        </div>
    }
}

window.Menu = Menu;