"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CompleteTitle = function (_React$Component) {
    _inherits(CompleteTitle, _React$Component);

    function CompleteTitle() {
        _classCallCheck(this, CompleteTitle);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(CompleteTitle).apply(this, arguments));
    }

    _createClass(CompleteTitle, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            return false;
        }
    }, {
        key: "render",
        value: function render() {
            var title = this.props.title;

            var charsNodes = title.Characters.map(function (charStat, i) {
                var score = "";
                if (charStat.Score != 0) {
                    if (charStat.Score > 0) {
                        score += "+";
                    }
                    score += charStat.Score;
                }
                return React.createElement(
                    "p",
                    { key: '' + charStat.Id + i, className: "stat-char" },
                    React.createElement(
                        "span",
                        { className: "stat-char-score" },
                        score
                    ),
                    React.createElement("img", { src: charStat.Img, className: "stat-char-img" }),
                    React.createElement(
                        "a",
                        { target: "_blank", className: "stat-char-name", href: "http://myanimelist.net/character/" + charStat.Id },
                        charStat.Name
                    )
                );
            });
            var lowerTitle = title.Title.toLowerCase();
            var lowerEnglish = title.English.toLowerCase();
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
    }]);

    return CompleteTitle;
}(React.Component);

var StatsImagesGroup = function (_React$Component2) {
    _inherits(StatsImagesGroup, _React$Component2);

    function StatsImagesGroup() {
        _classCallCheck(this, StatsImagesGroup);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(StatsImagesGroup).apply(this, arguments));
    }

    _createClass(StatsImagesGroup, [{
        key: "render",
        value: function render() {
            var _props = this.props;
            var imagesArray = _props.imagesArray;
            var score = _props.score;

            var imagesGroup = [];
            for (var i = 0; i < imagesArray.length; i += 5) {
                imagesGroup.push(React.createElement(
                    "p",
                    { key: '' + i, className: "stat-char" },
                    React.createElement(
                        "span",
                        { className: "stat-char-score" },
                        score ? score * imagesArray.slice(i, i + 5).length : ""
                    ),
                    React.createElement("img", { src: imagesArray[i], className: "stat-char-img stat-change-img" }),
                    imagesArray[i + 1] ? React.createElement("img", { src: imagesArray[i + 1], className: "stat-char-img stat-change-img" }) : "",
                    imagesArray[i + 2] ? React.createElement("img", { src: imagesArray[i + 2], className: "stat-char-img stat-change-img" }) : "",
                    imagesArray[i + 3] ? React.createElement("img", { src: imagesArray[i + 3], className: "stat-char-img stat-change-img" }) : "",
                    imagesArray[i + 4] ? React.createElement("img", { src: imagesArray[i + 4], className: "stat-char-img stat-change-img" }) : ""
                ));
            }
            return React.createElement(
                "div",
                null,
                imagesGroup
            );
        }
    }]);

    return StatsImagesGroup;
}(React.Component);

var ChangeImage = function (_React$Component3) {
    _inherits(ChangeImage, _React$Component3);

    function ChangeImage() {
        _classCallCheck(this, ChangeImage);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(ChangeImage).apply(this, arguments));
    }

    _createClass(ChangeImage, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            return this.props.changeGroup.length != nextProps.changeGroup.length;
        }
    }, {
        key: "render",
        value: function render() {
            var changeGroup = this.props.changeGroup;

            return React.createElement(
                "div",
                { className: "title-scores" },
                React.createElement(
                    "p",
                    { className: "score-title-turn" },
                    "image: ",
                    changeGroup[0].Turn
                ),
                React.createElement(StatsImagesGroup, { imagesArray: changeGroup.map(function (change) {
                        return change.OldImg;
                    }), score: changeGroup[0].Score })
            );
        }
    }]);

    return ChangeImage;
}(React.Component);

var Advice = function (_React$Component4) {
    _inherits(Advice, _React$Component4);

    function Advice() {
        _classCallCheck(this, Advice);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Advice).apply(this, arguments));
    }

    _createClass(Advice, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            return this.props.adviceGroup.length != nextProps.adviceGroup.length;
        }
    }, {
        key: "render",
        value: function render() {
            var adviceGroup = this.props.adviceGroup;

            var adviceNodes = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = adviceGroup[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var advice = _step.value;

                    adviceNodes.push(React.createElement(StatsImagesGroup, { key: advice.Title, imagesArray: advice.Img, score: advice.Score / advice.Img.length }));
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return React.createElement(
                "div",
                { className: "title-scores" },
                React.createElement(
                    "p",
                    { className: "score-title-turn" },
                    "advice: ",
                    adviceGroup[0].Turn
                ),
                adviceNodes
            );
        }
    }]);

    return Advice;
}(React.Component);

var GameScore = function (_React$Component5) {
    _inherits(GameScore, _React$Component5);

    function GameScore() {
        _classCallCheck(this, GameScore);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(GameScore).apply(this, arguments));
    }

    _createClass(GameScore, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            var selected = nextProps.game.Field.filter(function (f) {
                return f.selected;
            });
            var titleName = "";
            if (selected.length > 0) {
                var selectedChar = selected[0];
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = nextProps.game.Score.CompletedTitles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var title = _step2.value;
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = title.Characters[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var char = _step3.value;

                                if (char.Img == selectedChar.Img) {
                                    titleName = title.Title;
                                }
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }
            var scoreEl = $('#score');
            if (this.props.game.Id != nextProps.game.Id) {
                scoreEl[0].scrollTop = 0;
                scoreEl.perfectScrollbar('update');
            }
            if (titleName) {
                var titleEl = $('a:contains(' + titleName + ')');

                if (titleEl.length) {
                    scoreEl[0].scrollTop = scoreEl[0].scrollTop + titleEl.position()['top'] - 15;
                    scoreEl.perfectScrollbar('update');
                }
            }
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            $('#score').perfectScrollbar();
        }
    }, {
        key: "getTotalScore",
        value: function getTotalScore() {
            if (this.props.game.Score.TotalScore != -1000) {
                return this.props.game.Score.TotalScore;
            }
            var _props2 = this.props;
            var completedTitles = _props2.completedTitles;
            var game = _props2.game;

            var totalScore = 0;
            completedTitles.forEach(function (title) {
                title.Characters.forEach(function (char) {
                    totalScore += char.Score;
                });
            });
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = game.Score.ChangeImgs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var change = _step4.value;

                    totalScore += change.Score;
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = game.Score.Advices[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var advice = _step5.value;

                    totalScore += advice.Score;
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            return totalScore;
        }
    }, {
        key: "groupByTurn",
        value: function groupByTurn(values) {
            var result = {};
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = values[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var val = _step6.value;

                    if (!(val.Turn in result)) {
                        result[val.Turn] = [];
                    }
                    result[val.Turn].push(val);
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            return result;
        }
    }, {
        key: "render",
        value: function render() {
            var _props3 = this.props;
            var completedTitles = _props3.completedTitles;
            var currentTurn = _props3.currentTurn;
            var game = _props3.game;

            var titlesNodes = completedTitles.map(function (title, i) {
                return [parseInt(title.Turn, 10), React.createElement(CompleteTitle, { key: 'complete' + title.Id + i, title: title })];
            });

            var changedImagesGroups = this.groupByTurn(game.Score.ChangeImgs);
            for (var turn in changedImagesGroups) {
                titlesNodes.push([parseInt(turn, 10), React.createElement(ChangeImage, { key: 'changeImage' + turn, changeGroup: changedImagesGroups[turn] })]);
            }

            var advicesGroups = this.groupByTurn(game.Score.Advices);
            for (var _turn in advicesGroups) {
                titlesNodes.push([parseInt(_turn, 10), React.createElement(Advice, { key: 'advice' + _turn, adviceGroup: advicesGroups[_turn] })]);
            }

            titlesNodes.sort(function (a, b) {
                return a[0] >= b[0] ? 1 : -1;
            });

            //last titles in the end of the list
            titlesNodes.reverse();
            var startDate = new Date().toLocaleString();
            if (game.Date) {
                startDate = new Date(game.Date).toLocaleString();
            }
            var gameTime = null;
            if (game.Score.TotalScore != -1000 && game.Date != game.EndDate) {
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
                        game.Difficulty + 1
                    )
                ),
                titlesNodes.map(function (item) {
                    return item[1];
                })
            );
        }
    }]);

    return GameScore;
}(React.Component);

//# sourceMappingURL=score.js.map