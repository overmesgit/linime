var ADD_TODO = 'ADD_TODO';
var SET_SELECTED = 'SET_SELECTED';
var SET_GLOBAL = 'SET_GLOBAL';

var setSelected = (index) => {
    return {
        type: SET_SELECTED,
        payload: index
    }
};

var setGlobal = () => {
    return {
        type: SET_GLOBAL
    }
};

var addTodo = () => {
    return {
        type: ADD_TODO
    }
};

var state = {todos: [], global: false};

var todosReducer = (state = [], action) => {
    switch (action.type) {
        case ADD_TODO:
            return [...state, {text: 'new', selected: false}];
        case SET_SELECTED:
            return state.map((todo, index) => {
                if (index === action.payload) {
                    return {...todo, selected: !todo.selected}
                }
                return todo
            });
        default:
            return state
    }
};

var globalReducer = (state = false, action) => {
    if (action.type == SET_GLOBAL) {
        return !state
    }
    return state;
};


var topReducer = (state = state, action) => {
    return {
        todos: todosReducer(state.todos, action),
        global: globalReducer(state.global, action)
    }
};

window.Store = Redux.createStore(topReducer, state);
window.Provider = ReactRedux.Provider;

function mapStateToProps(state) {
    return {
        app: state
    }
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: Redux.bindActionCreators({setSelected, addTodo, setGlobal}, dispatch)
  }
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
    render () {
        const { setSelected, text, selected } = this.props;
        console.log('render todo', selected);
        return <div onClick={this.setSelected.bind(this)}>{text} {selected?"selected":""}</div>
    }
}

class AppClass extends React.Component {
    render() {
        const { todos, global } = this.props.app;
        const { setSelected, addTodo, setGlobal } = this.props.appActions;
        var todosNode = todos.map((todo, i) => {
            return <Todo key={i} index={i} text={todo.text} selected={todo.selected} setSelected={setSelected} />
        });
        console.log('render app');
        return <div>
            <button onClick={addTodo}>Add todo</button>
            <button onClick={setGlobal}>Set global</button>
            {global?"global": ""}
            {todosNode}
        </div>
    }
}

var App = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(AppClass);



ReactDOM.render(
    <Provider store={Store}>
        <App />
    </Provider>,
    document.getElementById('root')
);