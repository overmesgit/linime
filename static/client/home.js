class Home extends React.Component {
    createGame(e) {
        this.props.createGame();
    }

    render() {
        return <div id="home" className="content">
            <h1>Anime Lines</h1>
            <h2 className="btn" id="newGame" onClick={this.createGame.bind(this)}>New game</h2>
        </div>
    }
}

window.Home = Home;