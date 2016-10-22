class Menu extends React.Component {
    componentDidMount() {
        $('.my-games-list').perfectScrollbar();
    }

    createGame(e) {
        if (!this.props.game.creating) {
            this.props.createGame(+this.refs.diff.value, this.refs.userName.value);
        }
    }

    completeGame(e) {
        this.props.completeGame(this.props.game.Id);
    }

    render() {
        const {myGames, getGame, game, createGameStatus, toggleCreateGame, changeImage, getAdvice, startTutorial} = this.props;

        var gamesNodes = myGames.map((gameId, i) => {
            return <p key={i} className="my-game btn" onClick={getGame.bind(this, gameId)}>{gameId}</p>
        });

        var completeNode = "";
        if(game.Score.TotalScore == -1000 && game.Id != 'test') {
            completeNode = <h2 className="menu-content-button btn complete-game" onClick={this.completeGame.bind(this)}>Complete game</h2>
        }

        var selectedChar = game.Field.filter(field => field.selected);

        return <div id="menu" className="window">
            <div className="menu-content">
                <h1>Anime Lines</h1>
                <h3>Line them all!</h3>
                <div className="game-control">
                    <h2 className="menu-content-button btn" onClick={startTutorial}>Tutorial</h2>
                    <h2 className="menu-content-button btn" onClick={toggleCreateGame}>New game</h2>
                    <div className={"difficulty" + (createGameStatus.hidden ? " difficulty-hidden": "")}>
                        <p>Difficulty:</p>
                        <select className="select-style" ref="diff" >
                            <option value="0">For normal people</option>
                            <option value="1" selected>Easy</option>
                            <option value="2">Normal</option>
                            <option value="3">Hard</option>
                            <option value="4">Flappy bird</option>
                        </select>
                        <p>MyAnimeList (Optional):</p>
                        <input className="mal-username" ref="userName"  placeholder="MyAnimeList username"/>
                        <div className="btn create-game" onClick={this.createGame.bind(this)}>{!game.creating ? "Create Game": "Loading"}</div>
                    </div>
                    {completeNode}
                    {game.Turn > 0 && game.Id != 'test' ? <h2 className="menu-content-button btn btn-green" onClick={getAdvice.bind(this, game.Id)}>Random advice</h2>: ""}
                    {(selectedChar == 0 || game.Id == 'test') || <h2 className="menu-content-button btn" onClick={changeImage.bind(this, game.Id, selectedChar[0])}>
                        Change image</h2>}
                </div>
                <div className="my-games-list">
                    <h3>My games:</h3>
                    {gamesNodes}
                </div>
            </div>
        </div>
    }
}