class Menu extends React.Component {
    componentDidMount() {
        $('.my-games-list').perfectScrollbar();
    }

    createGame(e) {
        this.props.createGame(+this.refs.charDiff.value, +this.refs.animeDiff.value, this.refs.userName.value);
    }

    completeGame(e) {
        this.props.completeGame(this.props.game.Id);
    }

    render() {
        const {myGames, getGame, game, createGameStatus, toggleCreateGame, changeImage, getAdvice} = this.props;

        var gamesNodes = myGames.map((gameId, i) => {
            return <p key={i} className="my-game btn" onClick={getGame.bind(this, gameId)}>{gameId}</p>
        });

        var completeNode = "";
        if(game.Score.TotalScore == -1) {
            completeNode = <h2 className="menu-content-button btn complete-game" onClick={this.completeGame.bind(this)}>Complete game</h2>
        }

        var selectedChar = game.Field.filter(field => field.selected);

        return <div id="menu" className="window">
            <div className="menu-content">
                <h1>Anime Lines</h1>
                <h3>Line them all!</h3>
                <div className="game-control">
                    <h2 className="menu-content-button btn" onClick={toggleCreateGame}>New game</h2>
                    <div className={"difficulty" + (createGameStatus.hidden ? " difficulty-hidden": "")}>
                        <p>Character Popularity:</p>
                        <select className="select-style" ref="charDiff" >
                            <option value="0">Easy</option>
                            <option value="1">Normal</option>
                            <option value="2">Hard</option>
                        </select>
                        <p>Anime Popularity:</p>
                        <select className="select-style" ref="animeDiff" >
                            <option value="0">Easy</option>
                            <option value="1">Normal</option>
                            <option value="2">Hard</option>
                        </select>
                        <p>Use MyAnimeList (Optional):</p>
                        <input className="mal-username" ref="userName"  placeholder="MyAnimeList username"/>
                        <div className="btn create-game" onClick={this.createGame.bind(this)}>Create Game</div>
                    </div>
                    {completeNode}
                    {selectedChar == 0 || <h2 className="menu-content-button btn" onClick={changeImage.bind(this, game.Id, selectedChar[0])}>
                        Change image</h2>}
                    {game.Turn > 0 ? <h2 className="menu-content-button btn btn-green" onClick={getAdvice.bind(this, game.Id)}>Get advice</h2>: ""}
                </div>
                <div className="my-games-list">
                    <h3>My games:</h3>
                    {gamesNodes}
                </div>
            </div>
        </div>
    }
}