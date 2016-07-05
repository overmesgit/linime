class AppClass extends React.Component {
    setGameView(e) {
        this.props.appActions.createGame();
    }
    setMainView(e) {
        this.props.appActions.setView(MAIN_VIEW);
    }

    render() {
        const view = this.props.app.view;
        if (view === MAIN_VIEW) {
            return <div>Main window
                <button onClick={this.setGameView.bind(this)}>Game view</button>
            </div>
        } else {
            return <div>Game window
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