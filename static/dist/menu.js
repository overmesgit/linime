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
        const { myGames, getGame, game, createGameStatus, toggleCreateGame, changeImage, getAdvice } = this.props;

        var gamesNodes = myGames.map((gameId, i) => {
            return React.createElement(
                "p",
                { key: i, className: "my-game btn", onClick: getGame.bind(this, gameId) },
                gameId
            );
        });

        var completeNode = "";
        if (game.Score.TotalScore == -1) {
            completeNode = React.createElement(
                "h2",
                { className: "menu-content-button btn complete-game", onClick: this.completeGame.bind(this) },
                "Complete game"
            );
        }

        var selectedChar = game.Field.filter(field => field.selected);

        return React.createElement(
            "div",
            { id: "menu", className: "window" },
            React.createElement(
                "div",
                { className: "menu-content" },
                React.createElement(
                    "h1",
                    null,
                    "Anime Lines"
                ),
                React.createElement(
                    "h3",
                    null,
                    "Line them all!"
                ),
                React.createElement(
                    "div",
                    { className: "game-control" },
                    React.createElement(
                        "h2",
                        { className: "menu-content-button btn", onClick: toggleCreateGame },
                        "New game"
                    ),
                    React.createElement(
                        "div",
                        { className: "difficulty" + (createGameStatus.hidden ? " difficulty-hidden" : "") },
                        React.createElement(
                            "p",
                            null,
                            "Character Popularity:"
                        ),
                        React.createElement(
                            "select",
                            { className: "select-style", ref: "charDiff" },
                            React.createElement(
                                "option",
                                { value: "0" },
                                "Easy"
                            ),
                            React.createElement(
                                "option",
                                { value: "1" },
                                "Normal"
                            ),
                            React.createElement(
                                "option",
                                { value: "2" },
                                "Hard"
                            )
                        ),
                        React.createElement(
                            "p",
                            null,
                            "Anime Popularity:"
                        ),
                        React.createElement(
                            "select",
                            { className: "select-style", ref: "animeDiff" },
                            React.createElement(
                                "option",
                                { value: "0" },
                                "Easy"
                            ),
                            React.createElement(
                                "option",
                                { value: "1" },
                                "Normal"
                            ),
                            React.createElement(
                                "option",
                                { value: "2" },
                                "Hard"
                            )
                        ),
                        React.createElement(
                            "p",
                            null,
                            "Use MyAnimeList (Optional):"
                        ),
                        React.createElement("input", { className: "mal-username", ref: "userName", placeholder: "MyAnimeList username" }),
                        React.createElement(
                            "div",
                            { className: "btn create-game", onClick: this.createGame.bind(this) },
                            "Create Game"
                        )
                    ),
                    completeNode,
                    selectedChar == 0 || React.createElement(
                        "h2",
                        { className: "menu-content-button btn", onClick: changeImage.bind(this, game.Id, selectedChar[0]) },
                        "Change image"
                    ),
                    game.Turn > 0 ? React.createElement(
                        "h2",
                        { className: "menu-content-button btn btn-green", onClick: getAdvice.bind(this, game.Id) },
                        "Get advice"
                    ) : ""
                ),
                React.createElement(
                    "div",
                    { className: "my-games-list" },
                    React.createElement(
                        "h3",
                        null,
                        "My games:"
                    ),
                    gamesNodes
                )
            )
        );
    }
}