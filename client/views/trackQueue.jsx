var React = require('react');

var createStoreMixin = require('utils/createStoreMixin.js');

var ResultsItem = require('views/TrackRow.jsx');

var QueueStore = require('stores/QueueStore.js'),
    QueueActions = require('actions/QueueActions.js');

var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") {
    hidden = "hidden";
    visibilityChange = "visibilitychange";
} else if (typeof document.mozHidden !== "undefined") {
    hidden = "mozHidden";
    visibilityChange = "mozvisibilitychange";
} else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
}


var TrackQueue = React.createClass({
    mixins: [createStoreMixin(QueueStore)],

    getStateFromStores(props) {
        return {
            queue: QueueStore.getSorted()
        };
    },

    componentDidMount() {
        QueueActions.loadQueue();

        document.addEventListener(visibilityChange, () => {
            this.loadQueue();
        }, false);

        this.loadQueue();
    },

    loadQueue() {
        clearTimeout(this.timer);

        if (document[hidden]) {
            return;
        }

        QueueActions.loadQueue();

        this.timer = setTimeout(() => {
            this.loadQueue();
        }, 5000);
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.query !== this.props.query) {
            this.setState(this.getStateFromStores(nextProps));
            QueueActions.loadQueue();
        }
    },

    render() {
        return (
            <div id="trackQueue">
                {this.state.queue.map(function(result) {
                    return <ResultsItem key={result.link} id={result.link} showVotes={true} />;
                })}
            </div>
        );
    }
});


module.exports = TrackQueue;