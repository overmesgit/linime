class AppClass extends React.Component {
    createGame(e) {
        this.props.appActions.createGame();
    }
    setMainView(e) {
        this.props.appActions.setView(MAIN_VIEW);
    }

    render() {
        const { view, game, message } = this.props.app;
        switch (view) {
            case MAIN_VIEW:
                return <div>Home
                    <button onClick={this.createGame.bind(this)}>Create game</button>
                </div>
            case LOADING_VIEW:
                return <div>Loading</div>
            case GAME_VIEW:
                return <div>Game {game}
                    <button onClick={this.setMainView.bind(this)}>Main view</button>
                </div>
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
    appActions: Redux.bindActionCreators({setView: setView, createGame: createGame}, dispatch)
  }
}

var App = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(AppClass);

ReactDOM.render(
    <Provider store={Store}>
        <App />
    </Provider>,
    document.getElementById('root')
);