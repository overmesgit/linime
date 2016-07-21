ReactCSSTransitionGroup = React.ReactCSSTransitionGroup;

class Character extends React.Component {
    selectChar() {
        this.props.selectChar(this.props.char);
    }

    shouldComponentUpdate(nextProps, nextState) {
        var checkList = ['Img', 'Row', 'Col', 'prevRow', 'prevCol', 'selected', 'toDelete', 'turn'];
        for (var i = 0; i < checkList.length; i++) {
            if (this.props.char[checkList[i]] != nextProps.char[checkList[i]]) {
                return true;
            }
        }
        return this.props.gameTurn != nextProps.gameTurn;
    }

    render() {
        const { gameTurn } = this.props;
        const { Img, Row, Col, prevRow, prevCol, selected, toDelete, turn } = this.props.char;
        var classes = ["char-cell", "row" + Row, "col" + Col, selected ? "selected" : "", toDelete ? "cell-remove" : "", turn == gameTurn - 1 ? "new" : "", turn == gameTurn ? "appear" : ""];
        return React.createElement(
            'div',
            { className: classes.join(" "),
                onClick: this.selectChar.bind(this) },
            React.createElement('img', { src: Img, className: 'char' })
        );
    }
}

class FieldCell extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }
    moveSelected() {
        var char = this.props.game.Field.find(char => {
            if (char.selected) {
                return char;
            }
        });
        if (char) {
            this.props.moveSelected(this.props.game.Id, char, this.props.row, this.props.col);
        }
    }

    render() {
        const { row, col, game } = this.props;
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
}

class Game extends React.Component {
    render() {
        const { game, selectChar, moveSelected } = this.props;
        var fieldCell = [];
        for (var row = 0; row < game.Width; row++) {
            for (var col = 0; col < game.Height; col++) {
                fieldCell.push(React.createElement(FieldCell, { key: '' + row + col, row: row, col: col,
                    game: game, moveSelected: moveSelected }));
            }
        }
        var characters = game.Field.map((charData, i) => {
            return React.createElement(Character, { key: charData.Img.slice(-8, -4) + charData.Col + charData.Row, char: charData,
                selectChar: selectChar, gameTurn: game.Turn });
        });

        return React.createElement(
            'div',
            { id: 'game', className: 'window' },
            fieldCell,
            characters
        );
    }
}