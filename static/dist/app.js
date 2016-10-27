"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function nocontext(e) {
    var clickedTag = e == null ? event.srcElement.tagName : e.target.tagName;
    if (clickedTag == "IMG") return false;
}
document.oncontextmenu = nocontext;

var Error = function (_React$Component) {
    _inherits(Error, _React$Component);

    function Error() {
        _classCallCheck(this, Error);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Error).apply(this, arguments));
    }

    _createClass(Error, [{
        key: "render",
        value: function render() {
            var error = this.props.error;

            return React.createElement(
                "div",
                { className: "error" },
                error
            );
        }
    }]);

    return Error;
}(React.Component);

var AppClass = function (_React$Component2) {
    _inherits(AppClass, _React$Component2);

    function AppClass() {
        _classCallCheck(this, AppClass);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(AppClass).apply(this, arguments));
    }

    _createClass(AppClass, [{
        key: "componentWillMount",
        value: function componentWillMount() {
            if (this.props.app.fetchingGame != '') {
                this.props.appActions.getGame(this.props.app.fetchingGame);
                this.props.app.fetchingGame = '';
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            var game = this.props.app.game;
            var getAdvice = this.props.appActions.getAdvice;

            if (game.Id && game.Difficulty == 0 && game.Field.filter(function (char) {
                return char.advice;
            }).length == 0) {
                getAdvice(game.Id);
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _props$app = this.props.app;
            var game = _props$app.game;
            var error = _props$app.error;
            var myGames = _props$app.myGames;
            var createGameStatus = _props$app.createGameStatus;
            var tutorialState = _props$app.tutorialState;
            var showTop = _props$app.showTop;
            var topGames = _props$app.topGames;
            var _props$appActions = this.props.appActions;
            var createGame = _props$appActions.createGame;
            var completeGame = _props$appActions.completeGame;
            var selectChar = _props$appActions.selectChar;
            var moveSelected = _props$appActions.moveSelected;
            var getGame = _props$appActions.getGame;
            var toggleCreateGame = _props$appActions.toggleCreateGame;
            var changeImage = _props$appActions.changeImage;
            var getAdvice = _props$appActions.getAdvice;
            var startTutorial = _props$appActions.startTutorial;
            var endTutorial = _props$appActions.endTutorial;
            var nextTutorial = _props$appActions.nextTutorial;
            var moveSelectedTutorial = _props$appActions.moveSelectedTutorial;
            var showTopGames = _props$appActions.showTopGames;
            var closeTopGames = _props$appActions.closeTopGames;


            return React.createElement(
                "div",
                { className: "content fa" },
                React.createElement(Menu, { createGame: createGame, completeGame: completeGame, getGame: getGame, game: game, myGames: myGames,
                    toggleCreateGame: toggleCreateGame, createGameStatus: createGameStatus, changeImage: changeImage, getAdvice: getAdvice,
                    startTutorial: startTutorial, showTopGames: showTopGames, showTop: showTop, closeTopGames: closeTopGames }),
                React.createElement(Game, { game: game, selectChar: selectChar, moveSelected: moveSelected, tutorialState: tutorialState,
                    endTutorial: endTutorial, nextTutorial: nextTutorial, moveSelectedTutorial: moveSelectedTutorial,
                    showTop: showTop, topGames: topGames, getGame: getGame }),
                React.createElement(GameScore, { completedTitles: game.Score.CompletedTitles, currentTurn: game.Turn, game: game }),
                error != "" ? React.createElement(Error, { error: error }) : ""
            );
        }
    }]);

    return AppClass;
}(React.Component);

function mapStateToProps(state) {
    return {
        app: state
    };
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: Redux.bindActionCreators({ createGame: createGame, completeGame: completeGame, getGame: getGame, selectChar: selectChar,
            moveSelected: moveSelected, toggleCreateGame: toggleCreateGame, changeImage: changeImage, getAdvice: getAdvice, startTutorial: startTutorial,
            endTutorial: endTutorial, nextTutorial: nextTutorial, moveSelectedTutorial: moveSelectedTutorial, showTopGames: showTopGames, closeTopGames: closeTopGames }, dispatch)
    };
}

var App = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(AppClass);

ReactDOM.render(React.createElement(
    Provider,
    { store: Store },
    React.createElement(App, null)
), document.getElementById('root'));

//# sourceMappingURL=app.js.map