"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var tutorialStates = {
    1: { emotion: "/static/img/emo/tsundere.png", message: React.createElement(
            "div",
            { className: "tutorial-msg" },
            React.createElement(
                "p",
                null,
                "Ничего без меня сделать не можешь."
            ),
            React.createElement(
                "p",
                null,
                "Так уж и быть помогу тебе."
            ),
            React.createElement(
                "p",
                null,
                "Только не думай, что я делаю это ради тебя."
            )
        ), next: 2 },
    2: { emotion: "/static/img/emo/tsundere.png", message: React.createElement(
            "div",
            { className: "tutorial-msg" },
            React.createElement(
                "p",
                null,
                "Многие персонажи потерялись в мире фансервиса."
            ),
            React.createElement(
                "p",
                null,
                "Чтобы помочь им найти путь домой, необходимо собрать их силы вместе."
            )
        ), next: 3 },
    3: { emotion: "/static/img/emo/tsundere.png", message: React.createElement(
            "div",
            { className: "tutorial-msg" },
            React.createElement(
                "p",
                null,
                "Только те персонажи, которые знают друг друга, вместе становятся сильнее."
            ),
            React.createElement(
                "p",
                null,
                "Поэтому нужно выстроить персонажей из одного аниме в вертикальную, горизонтальную или диагональную линию."
            ),
            React.createElement(
                "p",
                null,
                "Давай попробуем на примере."
            )
        ), next: 0 }
};

var Tutorial = function (_React$Component) {
    _inherits(Tutorial, _React$Component);

    function Tutorial() {
        _classCallCheck(this, Tutorial);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Tutorial).apply(this, arguments));
    }

    _createClass(Tutorial, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.state) {
                if (!this.props.state) {
                    $('body').before('<div class="fog-of-war"></div>');
                }
            } else {
                $('.fog-of-war').remove();
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _props = this.props;
            var state = _props.state;
            var endTutorial = _props.endTutorial;
            var nextTutorial = _props.nextTutorial;

            if (state) {
                var _tutorialStates$state = tutorialStates[state];
                var emotion = _tutorialStates$state.emotion;
                var message = _tutorialStates$state.message;
                var next = _tutorialStates$state.next;

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
                    React.createElement(
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