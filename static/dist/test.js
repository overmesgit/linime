var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var ADD_TODO = 'ADD_TODO';
var SET_SELECTED = 'SET_SELECTED';
var SET_GLOBAL = 'SET_GLOBAL';

var setSelected = index => {
    return {
        type: SET_SELECTED,
        payload: index
    };
};

var setGlobal = () => {
    return {
        type: SET_GLOBAL
    };
};

var addTodo = () => {
    return {
        type: ADD_TODO
    };
};

var state = { todos: [], global: false };

var todosReducer = (state = [], action) => {
    switch (action.type) {
        case ADD_TODO:
            return [...state, { text: 'new', selected: false }];
        case SET_SELECTED:
            return state.map((todo, index) => {
                if (index === action.payload) {
                    return _extends({}, todo, { selected: !todo.selected });
                }
                return todo;
            });
        default:
            return state;
    }
};

var globalReducer = (state = false, action) => {
    if (action.type == SET_GLOBAL) {
        return !state;
    }
    return state;
};

var topReducer = (state = state, action) => {
    return {
        todos: todosReducer(state.todos, action),
        global: globalReducer(state.global, action)
    };
};

Store = Redux.createStore(topReducer, state);
Provider = ReactRedux.Provider;

function mapStateToProps(state) {
    return {
        app: state
    };
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: Redux.bindActionCreators({ setSelected, addTodo, setGlobal }, dispatch)
    };
}

class Todo extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        // return false;
        // console.log(this.props, nextProps, nextState);
        return this.props.selected != nextProps.selected;
    }
    setSelected() {
        this.props.setSelected(this.props.index);
        // this.setState({selected: !this.props.selected})
    }
    render() {
        const { setSelected, text, selected } = this.props;
        console.log('render todo', selected);
        return React.createElement(
            'div',
            { onClick: this.setSelected.bind(this) },
            text,
            ' ',
            selected ? "selected" : ""
        );
    }
}

class AppClass extends React.Component {
    render() {
        const { todos, global } = this.props.app;
        const { setSelected, addTodo, setGlobal } = this.props.appActions;
        var todosNode = todos.map((todo, i) => {
            return React.createElement(Todo, { key: i, index: i, text: todo.text, selected: todo.selected, setSelected: setSelected });
        });
        console.log('render app');
        return React.createElement(
            'div',
            null,
            React.createElement(
                'button',
                { onClick: addTodo },
                'Add todo'
            ),
            React.createElement(
                'button',
                { onClick: setGlobal },
                'Set global'
            ),
            global ? "global" : "",
            todosNode
        );
    }
}

var App = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(AppClass);

ReactDOM.render(React.createElement(
    Provider,
    { store: Store },
    React.createElement(App, null)
), document.getElementById('root'));