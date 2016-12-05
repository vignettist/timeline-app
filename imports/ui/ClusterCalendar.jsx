import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Clusters, Photos, LogicalImages} from '../api/photos.js';
import Cluster from './Cluster.jsx';
import ReactDOM from 'react-dom';

export class ClusterCalendar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      scrollCounter: 0
    };
  }

  previous() {
    FlowRouter.go('/clusters/' + this.props.date.add(-1, "d").format('YYYY-MM-DD'));
  }

  next() {
    FlowRouter.go('/clusters/' + this.props.date.add(+1, "d").format('YYYY-MM-DD'));
  }

  renderMonthLabel() {
    return this.props.date.format("MMMM YYYY")
  }

  handleScroll(event, template) {
    if ((event.deltaY > 0) && (this.state.scrollCounter < 0)) {
      this.setState({scrollCounter: 0});
    }

    if ((event.deltaY < 0) && (this.state.scrollCounter > 0)) {
      this.setState({scrollCounter: 0});
    }

    this.setState({scrollCounter: this.state.scrollCounter+event.deltaY});

    if (this.state.scrollCounter > 1500) {
      this.next();
      this.setState({scrollCounter: 0});
    }

    if (this.state.scrollCounter < -1500) {
      this.previous();
      this.setState({scrollCounter: 0});
    }
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this).addEventListener('mousewheel', this.handleScroll.bind(this));
  }

  goToCluster(e) {
    FlowRouter.go('/cluster/' + e._id._str);
  }

  render() {
    var start_date = this.props.date;
    var cluster_photos = this.props.photos;

    var timespans = this.props.clusters.map(function(e) {
      var local_start = new moment(e.start_time.utc_timestamp).utcOffset(e.start_time.tz_offset/60);
      var local_end = new moment(e.end_time.utc_timestamp).utcOffset(e.end_time.tz_offset/60);

      var local_display_start = start_date.clone().utcOffset(e.start_time.tz_offset/60);

      var cluster_height = local_end.unix() - local_start.unix();
      cluster_height /= (60*60*24*5);
      cluster_height *= 100;

      // have to manually correct for time zones
      var top = local_start.unix() - local_display_start.clone().subtract(2, 'days').unix() + e.start_time.tz_offset;
      top /= (60*60*24);

      top *= 20;

      var zindex = (400 - (new moment(e.start_time.utc_timestamp).dayOfYear()))*24 - new moment(e.start_time.utc_timestamp).hour();
      var event_styles = {height: cluster_height.toString() + "%", top: top.toString() + "%", zIndex: zindex};
      var event_photos = e.photos.map(function(x) { return x._str; });
      var photos_in_event = cluster_photos.filter(function(p) {
        return (event_photos.indexOf(p._id._str) >= 0);
      });

      if (e.photos.length > 1) {
        // 
        return (
          <div key={e._id._str} className="event" style={event_styles} onClick={() => this.goToCluster(e)}>
            <Cluster cluster={e} photos={photos_in_event}/>
          </div>);
      } else {
        return (<div key={e._id._str} className="event-singleton" style={event_styles}>
            <Cluster cluster={e} photos={photos_in_event}/>
          </div> )
      }
    }, this);

    var date_grid = [];

    for (var i = -2; i <= 2; i++) {
      if (i < 0) {
        var modified_date = this.props.date.clone().subtract(math.abs(i), 'days');
      } else {
        var modified_date = this.props.date.clone().add(i ,'days');
      }

      date_grid.push(<div className="weekday"><div>{modified_date.format("dddd, MMM D")}</div></div>);
    }

    return (
        <div className="cluster-root">
          <div className="nav">
            <button className="up" onClick={this.previous.bind(this)}>
              <img src="/icons/up.png" />
            </button>
            <button className="down" onClick={this.next.bind(this)}>
              <img src="/icons/down.png" />
            </button>
          </div>
          <div className="weekdays">
            <div className="grid">{date_grid}</div>
            <div key="clusters">{timespans}</div>
          </div>
        </div>
    );
  }

}
 
ClusterCalendar.propTypes = {
  clusters: PropTypes.array.isRequired,
  date: PropTypes.object.isRequired,
  photos: PropTypes.array.isRequired
};

export default createContainer(() => {
  return {
    clusters: Clusters.find({}).fetch(),
    photos: LogicalImages.find({}).fetch()
  };

}, ClusterCalendar);
