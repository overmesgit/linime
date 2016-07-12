class AppClass extends React.Component {
    componentWillMount() {
        if (this.props.app.fetchingGame != '') {
            this.props.appActions.getGame(this.props.app.fetchingGame);
            this.props.app.fetchingGame = '';
        }
    }

    render() {
        const {game, messages, myGames} = this.props.app;
        const {createGame, completeGame, selectChar, moveSelected, getGame} = this.props.appActions;
        return <div className="content">
            <Menu createGame={createGame} completeGame={completeGame} getGame={getGame} game={game} myGames={myGames} />
            <Game game={game} selectChar={selectChar} moveSelected={moveSelected} />
            <GameScore completedTitles={game.Score.CompletedTitles} currentTurn={game.Turn} />
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
        appActions: Redux.bindActionCreators({createGame, completeGame, getGame, selectChar, moveSelected}, dispatch)
    }
}

var App = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(AppClass);

ReactDOM.render(
    <Provider store={Store}>
        <App />
    </Provider>,
    document.getElementById('root')
);