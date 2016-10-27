class CompleteTitle extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }
    render() {
        const {title} = this.props;
        var charsNodes = title.Characters.map((charStat, i) => {
            var score = "";
            if (charStat.Score != 0) {
                if (charStat.Score > 0 ) {
                    score += "+";
                }
                score += charStat.Score;
            }
            return <p key={'' + charStat.Id + i} className="stat-char">
                <span className="stat-char-score">{score}</span>
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

class StatsImagesGroup extends React.Component {
    render() {
        const {imagesArray, score} = this.props;
        var imagesGroup = [];
        for(var i = 0; i < imagesArray.length; i += 5) {
            imagesGroup.push(<p key={'' + i} className="stat-char">
                <span className="stat-char-score">{ score ? score*(imagesArray.slice(i,i+5).length): "" }</span>
                <img src={imagesArray[i]} className="stat-char-img stat-change-img" />
                {imagesArray[i+1]?<img src={imagesArray[i+1]} className="stat-char-img stat-change-img" />:""}
                {imagesArray[i+2]?<img src={imagesArray[i+2]} className="stat-char-img stat-change-img" />:""}
                {imagesArray[i+3]?<img src={imagesArray[i+3]} className="stat-char-img stat-change-img" />:""}
                {imagesArray[i+4]?<img src={imagesArray[i+4]} className="stat-char-img stat-change-img" />:""}
            </p>)
        }
        return <div>
            {imagesGroup}
        </div>
    }
}

class ChangeImage extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return this.props.changeGroup.length != nextProps.changeGroup.length
    }
    render() {
        const {changeGroup} = this.props;
        return <div className="title-scores">
            <p className="score-title-turn">image: {changeGroup[0].Turn}</p>
            <StatsImagesGroup imagesArray={changeGroup.map(change => change.OldImg)} score={changeGroup[0].Score} />
        </div>
    }
}

class Advice extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return this.props.adviceGroup.length != nextProps.adviceGroup.length
    }
    render() {
        const {adviceGroup} = this.props;
        var adviceNodes = [];
        for (var advice of adviceGroup) {
            adviceNodes.push(<StatsImagesGroup key={advice.Title} imagesArray={advice.Img} score={advice.Score/advice.Img.length} />)
        }

        return <div className="title-scores">
            <p className="score-title-turn">advice: {adviceGroup[0].Turn}</p>
            {adviceNodes}
        </div>
    }
}

class GameScore extends React.Component {
    componentWillReceiveProps(nextProps) {
        var selected = nextProps.game.Field.filter(f => {
            return f.selected
        });
        var titleName = "";
        if (selected.length > 0) {
            var selectedChar = selected[0];
            for (var title of nextProps.game.Score.CompletedTitles) {
                for (var char of title.Characters) {
                    if (char.Img == selectedChar.Img) {
                        titleName = title.Title
                    }
                }
            }
        }
        const scoreEl = $('#score');
        if (this.props.game.Id != nextProps.game.Id) {
            scoreEl[0].scrollTop = 0;
            scoreEl.perfectScrollbar('update');
        }
        if (titleName) {
            const titleEl = $('a:contains(' + titleName + ')');

            if (titleEl.length) {
                scoreEl[0].scrollTop = scoreEl[0].scrollTop + titleEl.position()['top'] - 15;
                scoreEl.perfectScrollbar('update');
            }
        }
    }

    componentDidMount() {
        $('#score').perfectScrollbar();
    }

    getTotalScore() {
        if (this.props.game.Score.TotalScore != -1000) {
            return this.props.game.Score.TotalScore;
        }
        const {completedTitles, game} = this.props;
        var totalScore = 0;
        completedTitles.forEach((title) => {
            title.Characters.forEach((char) => {
                totalScore += char.Score;
            })
        });
        for (var change of game.Score.ChangeImgs) {
            totalScore += change.Score
        }
        for (var advice of game.Score.Advices) {
            totalScore += advice.Score
        }

        return totalScore;
    }

    groupByTurn(values) {
        var result = {};
        for(var val of values) {
            if (!(val.Turn in result)) {
                result[val.Turn] = []
            }
            result[val.Turn].push(val)
        }
        return result;
    }

    render() {
        const {completedTitles, currentTurn, game} = this.props;
        var titlesNodes = completedTitles.map((title, i) => {
            return [parseInt(title.Turn, 10), <CompleteTitle key={'complete' + title.Id + i} title={title} />]
        });

        var changedImagesGroups = this.groupByTurn(game.Score.ChangeImgs);
        for(const turn in changedImagesGroups) {
            titlesNodes.push([parseInt(turn, 10), <ChangeImage key={'changeImage' + turn} changeGroup={changedImagesGroups[turn]} />])
        }

        var advicesGroups = this.groupByTurn(game.Score.Advices);
        for(const turn in advicesGroups) {
            titlesNodes.push([parseInt(turn, 10), <Advice key={'advice' + turn} adviceGroup={advicesGroups[turn]} />])
        }

        titlesNodes.sort((a,b) => a[0] >= b[0] ? 1: -1);

        //last titles in the end of the list
        titlesNodes.reverse();
        var startDate = new Date().toLocaleString();
        if (game.Date) {
            startDate = new Date(game.Date).toLocaleString()
        }
        var gameTime = null;
        if (game.Score.TotalScore != -1000 && game.Date != game.EndDate) {
            gameTime = Math.round((new Date(game.EndDate) - new Date(game.Date))/1000/60)
        }
        return <div id="score" className="window">
            <p>Turn: {currentTurn}</p>
            <p>Total score: {this.getTotalScore()}</p>
            <div className="difficulty-stat">
                <p>Start date: {startDate}</p>
                {gameTime ? <p>Game time: {gameTime} min</p>:""}
                {game.UserName != "" ? <p>MAL User: {game.UserName}</p>: ""}
                <p>Difficulty: {game.Difficulty+1}</p>
            </div>
            {titlesNodes.map(item => item[1])}

        </div>
    }
}