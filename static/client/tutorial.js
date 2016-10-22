class Tutorial extends React.Component {
    componentWillMount() {
        $('body').before('<div class="fog-of-war"></div>')
    }
    render() {
        const {state} = this.props;
        return <div id="tutorial">
            {'State: ' + state}
        </div>
    }
}