'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Character = function (_React$Component) {
    _inherits(Character, _React$Component);

    function Character() {
        _classCallCheck(this, Character);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Character).apply(this, arguments));
    }

    _createClass(Character, [{
        key: 'selectChar',
        value: function selectChar() {
            this.props.selectChar(this.props.char);
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            var checkList = ['Img', 'Row', 'Col', 'prevRow', 'prevCol', 'selected', 'toDelete', 'turn', 'advice'];
            for (var i = 0; i < checkList.length; i++) {
                if (this.props.char[checkList[i]] != nextProps.char[checkList[i]]) {
                    return true;
                }
            }
            return this.props.gameTurn != nextProps.gameTurn;
        }
    }, {
        key: 'render',
        value: function render() {
            var gameTurn = this.props.gameTurn;
            var _props$char = this.props.char;
            var Img = _props$char.Img;
            var Row = _props$char.Row;
            var Col = _props$char.Col;
            var prevRow = _props$char.prevRow;
            var prevCol = _props$char.prevCol;
            var selected = _props$char.selected;
            var toDelete = _props$char.toDelete;
            var turn = _props$char.turn;
            var advice = _props$char.advice;

            var classes = ["char-cell", "row" + Row, "col" + Col, advice ? "advice" : "", selected ? "selected" : "", toDelete ? "cell-remove" : "", turn == gameTurn - 1 ? "new" : "", turn == gameTurn ? "appear" : ""];
            return React.createElement(
                'div',
                { className: classes.join(" "),
                    onClick: this.selectChar.bind(this) },
                React.createElement('img', { src: Img, className: 'char' })
            );
        }
    }]);

    return Character;
}(React.Component);

var FieldCell = function (_React$Component2) {
    _inherits(FieldCell, _React$Component2);

    function FieldCell() {
        _classCallCheck(this, FieldCell);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FieldCell).apply(this, arguments));
    }

    _createClass(FieldCell, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            return false;
        }
    }, {
        key: 'moveSelected',
        value: function moveSelected() {
            var char = this.props.game.Field.find(function (char) {
                if (char.selected) {
                    return char;
                }
            });
            if (char) {
                this.props.moveSelected(this.props.game.Id, char, this.props.row, this.props.col);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var row = _props.row;
            var col = _props.col;
            var game = _props.game;

            var fieldClasses = ["fieldCell"];
            if (row == 0) {
                fieldClasses.push('topRow');
            }
            if (row == game.Width - 1) {
                fieldClasses.push('bottomRow');
            }
            if (col == 0) {
                fieldClasses.push('leftCol');
            }
            if (col == game.Height - 1) {
                fieldClasses.push('rightCol');
            }
            return React.createElement('div', { onClick: this.moveSelected.bind(this), className: fieldClasses.join(' ') });
        }
    }]);

    return FieldCell;
}(React.Component);

var Game = function (_React$Component3) {
    _inherits(Game, _React$Component3);

    function Game() {
        _classCallCheck(this, Game);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Game).apply(this, arguments));
    }

    _createClass(Game, [{
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var game = _props2.game;
            var selectChar = _props2.selectChar;
            var moveSelected = _props2.moveSelected;
            var tutorialState = _props2.tutorialState;
            var endTutorial = _props2.endTutorial;
            var nextTutorial = _props2.nextTutorial;

            var fieldCell = [];
            for (var row = 0; row < game.Width; row++) {
                for (var col = 0; col < game.Height; col++) {
                    fieldCell.push(React.createElement(FieldCell, { key: '' + row + col, row: row, col: col,
                        game: game, moveSelected: moveSelected }));
                }
            }
            var characters = game.Field.map(function (charData, i) {
                return React.createElement(Character, { key: charData.Img.slice(-8, -4) + charData.Col + charData.Row, char: charData,
                    selectChar: selectChar, gameTurn: game.Turn });
            });

            return React.createElement(
                'div',
                { id: 'game', className: 'window' },
                React.createElement(Tutorial, { state: tutorialState, endTutorial: endTutorial, nextTutorial: nextTutorial }),
                fieldCell,
                characters
            );
        }
    }]);

    return Game;
}(React.Component);

//# sourceMappingURL=game.js.map