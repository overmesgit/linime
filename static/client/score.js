class CompleteTitle extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }
    render() {
        const {title} = this.props;
        var charsNodes = title.Characters.map((charStat, i) => {
            return <p key={'' + charStat.Id + i} className="stat-char">
                <span className="stat-char-score">{(charStat.Score > 0 ? "+":"")}{charStat.Score}</span>
                <img src={charStat.Img} className="stat-char-img" />
                <a target="_blank" className="stat-char-name" href={"http://myanimelist.net/character/" + charStat.Id}>{charStat.Name}</a>
            </p>
        });
        const lowerTitle = title.Title.toLowerCase();
        const lowerEnglish = title.English.toLowerCase();
        var isEnglishNeeded = title.English && lowerTitle.search(lowerEnglish) == -1 && lowerTitle != lowerEnglish;
        return <div className="title-scores">
            <p className="score-title-turn">turn: {title.Turn}</p>
            <a target="_blank" className="score-title-name" href={"http://myanimelist.net/anime/" + title.Id}>
                {title.Title} {isEnglishNeeded ? "(" + title.English + ")":""}</a>
            {charsNodes}
        </div>
    }
}

class GameScore extends React.Component {
    componentDidMount() {
        $('#score').perfectScrollbar();
    }

    getTotalScore() {
        const {completedTitles} = this.props;
        var totalScore = 0;
        completedTitles.forEach((title) => {
            title.Characters.forEach((char) => {
                totalScore += char.Score;
            })
        });
        return totalScore;
    }
    render() {
        const {completedTitles, currentTurn, game} = this.props;
        var titlesNodes = completedTitles.map((title, i) => {
            return <CompleteTitle key={'' + title.Id + i} title={title} />
        });
        //last titles in the end of the list
        titlesNodes.reverse();
        var startDate = null;
        if (game.Date) {
            startDate = new Date(game.Date).toLocaleString()
        }
        var gameTime = null;
        if (game.Score.TotalScore >= 0 && game.Date != game.EndDate) {
            gameTime = Math.round((new Date(game.EndDate) - new Date(game.Date))/1000/60)
        }
        return <div id="score" className="window">
            <p>Turn: {currentTurn}</p>
            <p>Total score: {this.getTotalScore()}</p>
            <div className="difficulty-stat">
                <p>Start date: {startDate}</p>
                {gameTime ? <p>Game time: {gameTime} min</p>:""}
                {game.UserName != "" ? <p>MAL User: {game.UserName}</p>: ""}
                <p>Difficulty: {game.CharDiff+1}C {game.AnimeDiff+1}A</p>
            </div>
            {titlesNodes}

        </div>
    }
}