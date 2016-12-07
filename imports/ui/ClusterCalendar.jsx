import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Clusters, ClustersTest, Photos, LogicalImages} from '../api/photos.js';
import Cluster from './Cluster.jsx';
import ReactDOM from 'react-dom';

export class ClusterCalendar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      scrollCounter: 0,
      cluster_algorithm: 0,
      cluster_threshold: 2,
      stretch_night: 0,
      timescale: 2
    };
  }

  previous() {
    FlowRouter.go('/clusters/' + this.props.date.add(-1, "d").format('YYYY-MM-DD'));
  }

  next() {
    FlowRouter.go('/clusters/' + this.props.date.add(+1, "d").format('YYYY-MM-DD'));
  }

  previousMonth() {
    FlowRouter.go('/clusters/' + this.props.date.add(-1, "month").format('YYYY-MM-DD'));
  }

  nextMonth() {
    FlowRouter.go('/clusters/' + this.props.date.add(+1, "month").format('YYYY-MM-DD'));
  }

  renderMonthLabel() {
    return this.props.date.format("MMMM YYYY")
  }

  nextAlgorithm() {
    console.log("nextAlgorithm");
    if (this.state.cluster_algorithm < 2) {
      this.setState({cluster_algorithm: this.state.cluster_algorithm+1});
    } else {
      this.setState({cluster_algorithm: 0});
    }
  }

  nextThreshold() {
    if (this.state.cluster_threshold < 8) {
      this.setState({cluster_threshold: this.state.cluster_threshold+1});
    } else {
      this.setState({cluster_threshold: 0});
    }
  }

  nextStretchNight() {
    if (this.state.stretch_night < 4) {
      this.setState({stretch_night: this.state.stretch_night+1});
    } else {
      this.setState({stretch_night: 0});
    }
  }

  nextTimescale() {
    if (this.state.timescale < 4) {
      this.setState({timescale: this.state.timescale+1});
    } else {
      this.setState({timescale: 0});
    }
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
    var algorithms = ["birch", "meanshift", "dbscan"];
    var algorithm = algorithms[this.state.cluster_algorithm];

    if (algorithm == "birch") {
      var thresholds = [0.3, 0.45, 0.6, 0.75, 0.9, 1.20, 1.35, 1.50, 1.65];
    } else if (algorithm == "meanshift") {
      var thresholds = [0.4, 0.6,  0.8, 1.0,  1.2, 1.4,  1.6,  1.8,  2.0];
    } else if (algorithm == "dbscan") {
      var thresholds = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2];
    }

    var threshold = thresholds[this.state.cluster_threshold];

    var timescales = [6.0, 12.0, 24.0, 48.0, 96.0];
    var timescale = timescales[this.state.timescale];

    var stretch_nights = [1.0, 2.0, 3.0, 5.0, 10.0];
    var stretch_night = stretch_nights[this.state.stretch_night];

    var start_date = this.props.date;

    var clusters = this.props.clusters.filter(function(e) {
      return ((e.type.algorithm == algorithm) && (e.type.threshold == threshold) && (e.type.timescale == timescale) && (e.type.stretch_nights == stretch_night));
    });

    // div class cluster name button next algorithm name of algorithm end button repeat
    var cluster_name = [
      // <div className="cluster-name">
        <button onClick={this.nextAlgorithm.bind(this)}>
          {algorithm}
        </button>,

        <button onClick={this.nextThreshold.bind(this)}>
          Threshold = {threshold}
        </button>,

        <button onClick={this.nextTimescale.bind(this)}>
          {timescale + "hours = 1"}
        </button>,

        <button onClick={this.nextStretchNight.bind(this)}>
          {"Stretching nights " + stretch_night + "x"}
        </button>];
      //</div>;

    var timespans = clusters.map(function(e) {
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
      var event_styles = {height: "calc(" + cluster_height.toString() + "% + 13px)", top: "calc(" + top.toString() + "% - 10px)", zIndex: zindex};
      var event_photos = e.photos.map(function(x) { return x._str; });

      var photo_markers = e.times.map(function(t, i) {
        var marker_start = new moment(t.utc_timestamp).utcOffset(t.tz_offset/60);

        var marker_top = marker_start.unix() - local_display_start.clone().subtract(2, 'days').unix() + t.tz_offset;
        marker_top /= (60*60*24);
        marker_top *= 20;

        var marker_style = {top: "calc(" + marker_top.toString() + "% - 5px)"};

        return <div key={e._id._str + "_marker_" + i.toString()} className="photo-marker" style={marker_style}></div>

      }, this);

      if (e.photos.length > 1) {
        // 
        return (
          <div>
          <div key={e._id._str} className="event" style={event_styles} onClick={() => this.goToCluster(e)}>
            <Cluster cluster={e} photos={[]}/>
          </div>
          {photo_markers}
          </div>);
      } else {
        return (<div>
          <div key={e._id._str} className="event-singleton" style={event_styles}>
            <Cluster cluster={e} photos={[]}/>
          </div>
          {photo_markers}
          </div>)
      }
    }, this);

    var date_grid = [];

    for (var i = -2; i <= 2; i++) {
      if (i < 0) {
        var modified_date = this.props.date.clone().subtract(math.abs(i), 'days');
      } else {
        var modified_date = this.props.date.clone().add(i ,'days');
      }

      date_grid.push(<div className="weekday" key={modified_date.format("dddd-MMM-D-YYYY")}><div>{modified_date.format("dddd, MMM D")}</div></div>);
    }

    return (
        <div className="cluster-root">
          <div className="nav">
            <button className="up" onClick={this.previousMonth.bind(this)}>
              <img src="/icons/doubleup.png" />
            </button>
            <button className="up" onClick={this.previous.bind(this)}>
              <img src="/icons/up.png" />
            </button>
            {cluster_name}
            <button className="down" onClick={this.next.bind(this)}>
              <img src="/icons/down.png" />
            </button>
            <button className="down" onClick={this.nextMonth.bind(this)}>
              <img src="/icons/doubledown.png" />
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
    clusters: ClustersTest.find({}).fetch(),
    photos: LogicalImages.find({}).fetch()
  };

}, ClusterCalendar);
