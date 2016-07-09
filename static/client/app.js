class AppClass extends React.Component {
    setMainView(e) {
        this.props.appActions.setView(MAIN_VIEW);
    }

    componentWillMount() {
        if(this.props.app.fetchingGame != '') {
            this.props.appActions.getGame(this.props.app.fetchingGame);
            this.props.app.fetchingGame = '';
        }
    }

    render() {
        const { view, game, message } = this.props.app;
        const { createGame, selectChar, moveSelected } = this.props.appActions;
        switch (view) {
            case MAIN_VIEW:
                return <Home createGame={createGame} />
            case LOADING_VIEW:
                return <div>Loading</div>
            case GAME_VIEW:
                return <Game game={game} selectChar={selectChar} moveSelected={moveSelected} />
            case ERROR_VIEW:
                return <div>Error {message}
                    <button onClick={this.setMainView.bind(this)}>Main view</button>
                </div>
        }
    }
}

function mapStateToProps(state) {
    return {
        app: state
    }
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: Redux.bindActionCreators({setView, createGame, getGame, selectChar, moveSelected}, dispatch)
  }
}

var App = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(AppClass);

ReactDOM.render(
    <Provider store={Store}>
        <App />
    </Provider>,
    document.getElementById('root')
);