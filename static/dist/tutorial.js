"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var initialTutorialMove = {
    7: { "Path": [[0, 6], [0, 5], [0, 4], [0, 3], [1, 3], [2, 3], [2, 2], [2, 1]],
        "Completed": [[2, 4], [1, 5], [0, 6]],
        "NewChars": [], "NextTurn": 2,
        "GameScore": [{ "Id": 17265, "Title": "Log Horizon", "English": "Log Horizon", "Turn": 2, "Characters": [{ "Id": 81371, "Name": "Naotsugu", "Img": "http://cdn.myanimelist.net/images/characters/11/200455.jpg", "Score": 1 }, { "Id": 81369, "Name": "Akatsuki", "Img": "http://cdn.myanimelist.net/images/characters/12/292611.jpg", "Score": 2 }, { "Id": 81367, "Name": "Shiroe", "Img": "http://cdn.myanimelist.net/images/characters/10/240997.jpg",
                "Score": 3 }] }] }
};

var initialTutorial = {
    "Id": "test",
    "Field": [{ "Img": "http://cdn.myanimelist.net/images/characters/10/240997.jpg", "Row": 2, "Col": 0 }, { "Img": "http://cdn.myanimelist.net/images/characters/12/292611.jpg", "Row": 2, "Col": 4 }, { "Img": "https://myanimelist.cdn-dena.com/images/characters/5/302315.jpg", "Row": 7, "Col": 4 }, { "Img": "http://cdn.myanimelist.net/images/characters/11/200455.jpg", "Row": 1, "Col": 5 }, { "Img": "http://cdn.myanimelist.net/images/characters/10/103220.jpg", "Row": 4, "Col": 1 }, { "Img": "http://cdn.myanimelist.net/images/characters/3/55714.jpg", "Row": 8, "Col": 0 }, { "Img": "http://cdn.myanimelist.net/images/characters/14/80297.jpg", "Row": 4, "Col": 5 }],
    "Height": 9,
    "Width": 9,
    "Line": 3,
    "MaxTitleChar": 5,
    "Turn": 1,
    "Score": {
        "CompletedTitles": [],
        "CompletedGroups": [],
        "TotalScore": -1000,
        "ChangeImgs": [],
        "Advices": []
    },
    "Date": "2016-08-08T22:21:52.819+03:00",
    "EndDate": "2016-08-08T22:21:52.819+03:00",
    "Difficulty": 1,
    "UserName": "",
    "UserItems": []
};

var charSelected20 = function charSelected20(game) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = game.Field[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var field = _step.value;

            if (field.Row == 2 && field.Col == 0 && field.selected) {
                return true;
            }
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

    return false;
};

var charNotSelected20 = function charNotSelected20(game) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = game.Field[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var field = _step2.value;

            if (field.Row == 2 && field.Col == 0 && !field.selected) {
                return true;
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

    return false;
};

var charDisapear24 = function charDisapear24(game) {
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = game.Field[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var field = _step3.value;

            if (field.Row == 2 && field.Col == 4) {
                return false;
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

    return true;
};

var tutorialStates = {
    1: {
        emotion: "/static/img/emo/tsundere.png", message: React.createElement(
            "div",
            { className: "tutorial-msg" },
            React.createElement(
                "p",
                null,
                "You can't do anything without me, can you?"
            ),
            React.createElement(
                "p",
                null,
                "It can't be helped; I'll assist you."
            ),
            React.createElement(
                "p",
                null,
                "I'm not doing it for YOU or anything!"
            )
        ), next: { state: 2 }
    },
    2: {
        emotion: "/static/img/emo/tsundere.png", message: React.createElement(
            "div",
            { className: "tutorial-msg" },
            React.createElement(
                "p",
                null,
                "A lot of characters got lost in the Fanservice World."
            ),
            React.createElement(
                "p",
                null,
                "To help them find the way home, you should bring their powers together."
            )
        ), next: { state: 3 }
    },
    3: {
        emotion: "/static/img/emo/tsundere.png", message: React.createElement(
            "div",
            { className: "tutorial-msg" },
            React.createElement(
                "p",
                null,
                "However, only characters who know each other can get stronger together."
            ),
            React.createElement(
                "p",
                null,
                "For that, you have to line up at least 3 of them together in one straight line. (Diagonal line is fine as well)"
            )
        ), next: { state: 4 }
    },
    4: {
        emotion: "/static/img/emo/tsundere.png", message: React.createElement(
            "div",
            { className: "tutorial-msg" },
            React.createElement(
                "p",
                null,
                "When there are 3 or more characters lined up, they get to go home together with all of their friends."
            ),
            React.createElement(
                "p",
                null,
                "I'll give you points for this."
            ),
            React.createElement(
                "p",
                null,
                "Let's try this example."
            )
        ), next: { state: 5, game: initialTutorial }
    },
    5: {
        emotion: "/static/img/emo/normal.png", message: React.createElement(
            "div",
            { className: "tutorial-msg" },
            React.createElement(
                "p",
                null,
                "Look, here are your buddies from Log Horizon."
            ),
            React.createElement(
                "p",
                null,
                "Let's help them."
            )
        ), next: { state: 6 }
    },
    6: {
        emotion: "/static/img/emo/normal.png", message: React.createElement(
            "div",
            { className: "tutorial-msg" },
            React.createElement(
                "p",
                null,
                "Choose Shiroe by clicking on him."
            )
        ), next: { state: 7 }, selected: ['.row2.col0'], hiddenNext: true, nextCondition: { 7: charSelected20 }
    },
    7: {
        emotion: "/static/img/emo/normal.png", message: React.createElement(
            "div",
            { className: "tutorial-msg" },
            React.createElement(
                "p",
                null,
                "Now, click on the green cell to move him onto it."
            )
        ), next: { state: 8 }, selected: ['.fieldCell:eq(6)', '#game'], hiddenNext: true, nextCondition: { 8: charDisapear24, 20: charNotSelected20 }
    },
    8: {
        emotion: "/static/img/emo/success.png", message: React.createElement(
            "div",
            { className: "tutorial-msg" },
            React.createElement(
                "p",
                null,
                "Perfect! Our heroes can now go home."
            )
        ), next: { state: 9 }
    },
    9: {
        emotion: "/static/img/emo/sure.png", message: React.createElement(
            "div",
            { className: "tutorial-msg" },
            React.createElement(
                "p",
                null,
                "You managed to cope with the training course."
            ),
            React.createElement(
                "p",
                null,
                "It couldn't be otherwise since you were trained by me!"
            )
        ), next: { state: 10 }
    },
    10: {
        emotion: "/static/img/emo/sure.png", message: React.createElement(
            "div",
            { className: "tutorial-msg" },
            React.createElement(
                "p",
                null,
                "I still think our developer is useless though. If you find an error, do contact him at overmes@gmail.com"
            )
        ), next: { state: 11 }
    },
    11: {
        emotion: "/static/img/emo/waityou.png", message: React.createElement(
            "div",
            { className: "tutorial-msg" },
            React.createElement(
                "p",
                null,
                "We will see each other again, won't we?"
            )
        ), next: { state: 0 }
    },
    20: {
        emotion: "/static/img/emo/panic.png", message: React.createElement(
            "div",
            { className: "tutorial-msg" },
            React.createElement(
                "p",
                null,
                "B-baka! What are you doing?! Choose Shiroe back!"
            ),
            React.createElement(
                "p",
                null,
                "Budget lacks for a full explanation."
            )
        ), next: { state: 7 }, selected: ['.row2.col0'], hiddenNext: true, nextCondition: { 7: charSelected20 }
    }

};

var Tutorial = function (_React$Component) {
    _inherits(Tutorial, _React$Component);

    function Tutorial() {
        _classCallCheck(this, Tutorial);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Tutorial).apply(this, arguments));
    }

    _createClass(Tutorial, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            if (this.props.state) {
                $('body').before('<div class="fog-of-war"></div>');
            }
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            var state = nextProps.state;
            var endTutorial = nextProps.endTutorial;
            var nextTutorial = nextProps.nextTutorial;
            var game = nextProps.game;

            if (state) {
                var _tutorialStates$state = tutorialStates[state];
                var emotion = _tutorialStates$state.emotion;
                var message = _tutorialStates$state.message;
                var next = _tutorialStates$state.next;
                var hiddenNext = _tutorialStates$state.hiddenNext;
                var nextCondition = _tutorialStates$state.nextCondition;

                if (nextCondition) {
                    for (var stateId in nextCondition) {
                        if (nextCondition[stateId](game)) {
                            nextTutorial({ state: stateId });
                        }
                    }
                }
            }
            if (nextProps.state) {
                if (!this.props.state) {
                    $('body').before('<div class="fog-of-war"></div>');
                }
            } else {
                $('.fog-of-war').remove();
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            $('.tutorial-selected').removeClass('tutorial-selected');
            if (this.props.state) {
                var selected = tutorialStates[this.props.state].selected;
                if (selected && selected.length) {
                    selected.forEach(function (selector) {
                        $(selector).addClass('tutorial-selected');
                    });
                }
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _props = this.props;
            var state = _props.state;
            var endTutorial = _props.endTutorial;
            var nextTutorial = _props.nextTutorial;
            var game = _props.game;

            if (state) {
                var _tutorialStates$state2 = tutorialStates[state];
                var emotion = _tutorialStates$state2.emotion;
                var message = _tutorialStates$state2.message;
                var next = _tutorialStates$state2.next;
                var hiddenNext = _tutorialStates$state2.hiddenNext;
                var nextCondition = _tutorialStates$state2.nextCondition;

                return React.createElement(
                    "div",
                    { id: "tutorial" },
                    React.createElement("img", { src: emotion, className: "tutorial-img" }),
                    message,
                    React.createElement(
                        "span",
                        { className: "tutorial-end tutorial-btn btn", onClick: endTutorial },
                        "Close"
                    ),
                    hiddenNext ? '' : React.createElement(
                        "span",
                        { className: "tutorial-next tutorial-btn btn", onClick: nextTutorial.bind(null, next) },
                        "Next"
                    )
                );
            } else {
                return React.createElement("div", { style: { "display": "none" } });
            }
        }
    }]);

    return Tutorial;
}(React.Component);

//# sourceMappingURL=tutorial.js.map