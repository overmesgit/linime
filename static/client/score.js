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
        const {completedTitles, currentTurn} = this.props;
        var titlesNodes = completedTitles.map((title, i) => {
            return <CompleteTitle key={'' + title.Id + i} title={title} />
        });
        //last titles in the end of the list
        titlesNodes.reverse();
        return <div id="score" className="window">
            <p>Turn: {currentTurn}</p>
            <p>Total score: {this.getTotalScore()}</p>
            {titlesNodes}
        </div>
    }
}

window.GameScore = GameScore;