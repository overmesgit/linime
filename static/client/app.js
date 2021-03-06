function nocontext(e) {
    var clickedTag = (e == null) ? event.srcElement.tagName : e.target.tagName;
    if (clickedTag == "IMG")
        return false;
}
document.oncontextmenu = nocontext;

class Error extends React.Component {
    render() {
        const {error} = this.props;
        return <div className="error">
            {error}
        </div>
    }
}

class AppClass extends React.Component {
    componentWillMount() {
        if (this.props.app.fetchingGame != '') {
            this.props.appActions.getGame(this.props.app.fetchingGame);
            this.props.app.fetchingGame = '';
        }
    }

    componentDidMount() {
        const {game} = this.props.app;
        const {startTestGame} = this.props.appActions;
        if (!game.Id && gameId == '') {
            startTestGame();
        }
    }

    componentDidUpdate() {
        const {game} = this.props.app;
        const {getAdvice} = this.props.appActions;
        if (game.Id && game.Difficulty == 0 && game.Field.filter(char => char.advice).length == 0) {
            getAdvice(game.Id);
        }
    }

    render() {
        const {game, error, myGames, createGameStatus} = this.props.app;
        const {createGame, completeGame, selectChar, moveSelected, getGame, toggleCreateGame, changeImage, getAdvice, startTestGame} = this.props.appActions;

        return <div className="content fa">
            <Menu createGame={createGame} completeGame={completeGame} getGame={getGame} game={game} myGames={myGames}
            toggleCreateGame={toggleCreateGame} createGameStatus={createGameStatus} changeImage={changeImage} getAdvice={getAdvice}/>
            <Game game={game} selectChar={selectChar} moveSelected={moveSelected} />
            <GameScore completedTitles={game.Score.CompletedTitles} currentTurn={game.Turn} game={game} />
            {error != "" ? <Error error={error} />: ""}
        </div>
    }
}

function mapStateToProps(state) {
    return {
        app: state
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: Redux.bindActionCreators({createGame, completeGame, getGame, selectChar,
            moveSelected, toggleCreateGame, changeImage, getAdvice, startTestGame}, dispatch)
    }
}

var App = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(AppClass);

ReactDOM.render(
    <Provider store={Store}>
        <App />
    </Provider>,
    document.getElementById('root')
);