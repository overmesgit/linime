"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Menu = function (_React$Component) {
    _inherits(Menu, _React$Component);

    function Menu() {
        _classCallCheck(this, Menu);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Menu).apply(this, arguments));
    }

    _createClass(Menu, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            $('.my-games-list').perfectScrollbar();
        }
    }, {
        key: "createGame",
        value: function createGame(e) {
            if (!this.props.game.creating) {
                this.props.createGame(+this.refs.diff.value, this.refs.userName.value);
            }
        }
    }, {
        key: "completeGame",
        value: function completeGame(e) {
            this.props.completeGame(this.props.game.Id);
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var myGames = _props.myGames;
            var getGame = _props.getGame;
            var game = _props.game;
            var createGameStatus = _props.createGameStatus;
            var toggleCreateGame = _props.toggleCreateGame;
            var changeImage = _props.changeImage;
            var getAdvice = _props.getAdvice;


            var gamesNodes = myGames.map(function (gameId, i) {
                return React.createElement(
                    "p",
                    { key: i, className: "my-game btn", onClick: getGame.bind(_this2, gameId) },
                    gameId
                );
            });

            var completeNode = "";
            if (game.Score.TotalScore == -1000) {
                completeNode = React.createElement(
                    "h2",
                    { className: "menu-content-button btn complete-game", onClick: this.completeGame.bind(this) },
                    "Complete game"
                );
            }

            var selectedChar = game.Field.filter(function (field) {
                return field.selected;
            });

            return React.createElement(
                "div",
                { id: "menu", className: "window" },
                React.createElement(
                    "div",
                    { className: "menu-content" },
                    React.createElement(
                        "h1",
                        null,
                        "Anime Lines"
                    ),
                    React.createElement(
                        "h3",
                        null,
                        "Line them all!"
                    ),
                    React.createElement(
                        "div",
                        { className: "game-control" },
                        React.createElement(
                            "h2",
                            { className: "menu-content-button btn", onClick: toggleCreateGame },
                            "New game"
                        ),
                        React.createElement(
                            "div",
                            { className: "difficulty" + (createGameStatus.hidden ? " difficulty-hidden" : "") },
                            React.createElement(
                                "p",
                                null,
                                "Difficulty:"
                            ),
                            React.createElement(
                                "select",
                                { className: "select-style", ref: "diff" },
                                React.createElement(
                                    "option",
                                    { value: "0" },
                                    "For normal people"
                                ),
                                React.createElement(
                                    "option",
                                    { value: "1", selected: true },
                                    "Easy"
                                ),
                                React.createElement(
                                    "option",
                                    { value: "2" },
                                    "Normal"
                                ),
                                React.createElement(
                                    "option",
                                    { value: "3" },
                                    "Hard"
                                ),
                                React.createElement(
                                    "option",
                                    { value: "4" },
                                    "Flappy bird"
                                )
                            ),
                            React.createElement(
                                "p",
                                null,
                                "MyAnimeList (Optional):"
                            ),
                            React.createElement("input", { className: "mal-username", ref: "userName", placeholder: "MyAnimeList username" }),
                            React.createElement(
                                "div",
                                { className: "btn create-game", onClick: this.createGame.bind(this) },
                                !game.creating ? "Create Game" : "Loading"
                            )
                        ),
                        completeNode,
                        game.Turn > 0 ? React.createElement(
                            "h2",
                            { className: "menu-content-button btn btn-green", onClick: getAdvice.bind(this, game.Id) },
                            "Random advice"
                        ) : "",
                        selectedChar == 0 || React.createElement(
                            "h2",
                            { className: "menu-content-button btn", onClick: changeImage.bind(this, game.Id, selectedChar[0]) },
                            "Change image"
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "my-games-list" },
                        React.createElement(
                            "h3",
                            null,
                            "My games:"
                        ),
                        gamesNodes
                    )
                )
            );
        }
    }]);

    return Menu;
}(React.Component);

//# sourceMappingURL=menu.js.map