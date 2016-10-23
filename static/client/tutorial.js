var tutorialStates = {
    1: {emotion: "/static/img/emo/tsundere.png", message:
        <div className="tutorial-msg">
            <p>Ничего без меня сделать не можешь.</p>
            <p>Так уж и быть помогу тебе.</p>
            <p>Только не думай, что я делаю это ради тебя.</p>
        </div>, next: 2},
    2: {emotion: "/static/img/emo/tsundere.png", message:
        <div className="tutorial-msg">
            <p>Многие персонажи потерялись в мире фансервиса.</p>
            <p>Чтобы помочь им найти путь домой, необходимо собрать их силы вместе.</p>
        </div>, next: 3},
    3: {emotion: "/static/img/emo/tsundere.png", message:
        <div className="tutorial-msg">
            <p>Только те персонажи, которые знают друг друга, вместе становятся сильнее.</p>
            <p>Поэтому нужно выстроить персонажей из одного аниме в вертикальную, горизонтальную или
            диагональную линию.</p>
            <p>Давай попробуем на примере.</p>
        </div>, next: 0},
};

class Tutorial extends React.Component {
    componentWillReceiveProps(nextProps) {
        if (nextProps.state) {
            if (!this.props.state) {
                $('body').before('<div class="fog-of-war"></div>')
            }
        } else {
            $('.fog-of-war').remove()
        }
    }
    render() {
        const {state, endTutorial, nextTutorial} = this.props;
        if (state) {
            const {emotion, message, next} = tutorialStates[state];
            return <div id="tutorial">
                <img src={emotion} className="tutorial-img"/>
                {message}
                <span className="tutorial-end tutorial-btn btn" onClick={endTutorial}>Close</span>
                <span className="tutorial-next tutorial-btn btn" onClick={nextTutorial.bind(null, next)}>Next</span>
            </div>
        } else {
            return <div style={{"display": "none"}}></div>
        }
    }
}