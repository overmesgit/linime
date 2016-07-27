class CompleteTitle extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }
    render() {
        const { title } = this.props;
        var charsNodes = title.Characters.map((charStat, i) => {
            return React.createElement(
                "p",
                { key: '' + charStat.Id + i, className: "stat-char" },
                React.createElement(
                    "span",
                    { className: "stat-char-score" },
                    charStat.Score > 0 ? "+" : "",
                    charStat.Score
                ),
                React.createElement("img", { src: charStat.Img, className: "stat-char-img" }),
                React.createElement(
                    "a",
                    { target: "_blank", className: "stat-char-name", href: "http://myanimelist.net/character/" + charStat.Id },
                    charStat.Name
                )
            );
        });
        const lowerTitle = title.Title.toLowerCase();
        const lowerEnglish = title.English.toLowerCase();
        var isEnglishNeeded = title.English && lowerTitle.search(lowerEnglish) == -1 && lowerTitle != lowerEnglish;
        return React.createElement(
            "div",
            { className: "title-scores" },
            React.createElement(
                "p",
                { className: "score-title-turn" },
                "turn: ",
                title.Turn
            ),
            React.createElement(
                "a",
                { target: "_blank", className: "score-title-name", href: "http://myanimelist.net/anime/" + title.Id },
                title.Title,
                " ",
                isEnglishNeeded ? "(" + title.English + ")" : ""
            ),
            charsNodes
        );
    }
}

class ChangeImage extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return this.props.changeGroup.length != nextProps.changeGroup.length;
    }
    render() {
        const { changeGroup } = this.props;
        var changeImagesNodes = [];
        for (var i = 0; i < changeGroup.length; i += 5) {
            changeImagesNodes.push(React.createElement(
                "p",
                { key: '' + i, className: "stat-char" },
                React.createElement(
                    "span",
                    { className: "stat-char-score" },
                    "-1"
                ),
                React.createElement("img", { src: changeGroup[i].Img, className: "stat-char-img stat-change-img" }),
                changeGroup[i + 1] ? React.createElement("img", { src: changeGroup[i + 1].Img, className: "stat-char-img stat-change-img" }) : "",
                changeGroup[i + 2] ? React.createElement("img", { src: changeGroup[i + 2].Img, className: "stat-char-img stat-change-img" }) : "",
                changeGroup[i + 3] ? React.createElement("img", { src: changeGroup[i + 3].Img, className: "stat-char-img stat-change-img" }) : "",
                changeGroup[i + 4] ? React.createElement("img", { src: changeGroup[i + 4].Img, className: "stat-char-img stat-change-img" }) : ""
            ));
        }
        return React.createElement(
            "div",
            { className: "title-scores" },
            React.createElement(
                "p",
                { className: "score-title-turn" },
                "turn: ",
                changeGroup[0].Turn
            ),
            changeImagesNodes
        );
    }
}

class GameScore extends React.Component {
    componentDidMount() {
        $('#score').perfectScrollbar();
    }

    getTotalScore() {
        const { completedTitles, game } = this.props;
        var totalScore = 0;
        completedTitles.forEach(title => {
            title.Characters.forEach(char => {
                totalScore += char.Score;
            });
        });
        totalScore -= game.Score.ChangeImgs.length;
        return totalScore;
    }
    render() {
        const { completedTitles, currentTurn, game } = this.props;
        var titlesNodes = completedTitles.map((title, i) => {
            return [title.Turn, React.createElement(CompleteTitle, { key: '' + title.Id + i, title: title })];
        });

        var changedImagesGroups = {};
        for (var change of game.Score.ChangeImgs) {
            if (!(change.Turn in changedImagesGroups)) {
                changedImagesGroups[change.Turn] = [];
            }
            changedImagesGroups[change.Turn].push(change);
        }

        for (var group in changedImagesGroups) {
            titlesNodes.push([group, React.createElement(ChangeImage, { key: 'changeImage' + group, changeGroup: changedImagesGroups[group] })]);
        }

        titlesNodes.sort((a, b) => a[0] >= b[0] ? 1 : -1);

        //last titles in the end of the list
        titlesNodes.reverse();
        var startDate = null;
        if (game.Date) {
            startDate = new Date(game.Date).toLocaleString();
        }
        var gameTime = null;
        if (game.Score.TotalScore >= 0 && game.Date != game.EndDate) {
            gameTime = Math.round((new Date(game.EndDate) - new Date(game.Date)) / 1000 / 60);
        }
        return React.createElement(
            "div",
            { id: "score", className: "window" },
            React.createElement(
                "p",
                null,
                "Turn: ",
                currentTurn
            ),
            React.createElement(
                "p",
                null,
                "Total score: ",
                this.getTotalScore()
            ),
            React.createElement(
                "div",
                { className: "difficulty-stat" },
                React.createElement(
                    "p",
                    null,
                    "Start date: ",
                    startDate
                ),
                gameTime ? React.createElement(
                    "p",
                    null,
                    "Game time: ",
                    gameTime,
                    " min"
                ) : "",
                game.UserName != "" ? React.createElement(
                    "p",
                    null,
                    "MAL User: ",
                    game.UserName
                ) : "",
                React.createElement(
                    "p",
                    null,
                    "Difficulty: ",
                    game.CharDiff + 1,
                    "C ",
                    game.AnimeDiff + 1,
                    "A"
                )
            ),
            titlesNodes.map(item => item[1])
        );
    }
}