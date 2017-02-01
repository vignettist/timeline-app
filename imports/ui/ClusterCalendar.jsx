import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Clusters, Photos, LogicalImages} from '../api/photos.js';
import Cluster from './Cluster.jsx';
import ReactDOM from 'react-dom';
import DateBlock from './DateBlock.jsx';
import DateButton from './DateButton.jsx';

var DatePicker = require('react-datepicker');


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

  previousMonth() {
    FlowRouter.go('/clusters/' + this.props.date.add(-1, "month").format('YYYY-MM-DD'));
  }

  nextMonth() {
    FlowRouter.go('/clusters/' + this.props.date.add(+1, "month").format('YYYY-MM-DD'));
  }

  newDate(date) {
    FlowRouter.go('/clusters/' + date.format('YYYY-MM-DD'));
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
      
      if (cluster_height > 0) {
        var event_styles = {height: "calc(" + cluster_height.toString() + "% + 13px)", top: "calc(" + top.toString() + "% - 10px)", zIndex: zindex};
      } else {
        var event_styles = {top: "calc(" + top.toString() + "% - 50px)", zIndex: zindex};
      }

      var event_photos = e.photos.map(function(x) { return x._str; });
      var photos_in_event = cluster_photos.filter(function(p) {
        return (event_photos.indexOf(p._id._str) >= 0);
      });

      var photo_markers = e.times.map(function(t, i) {
        var marker_start = new moment(t.utc_timestamp).utcOffset(t.tz_offset/60);

        var marker_top = marker_start.unix() - local_display_start.clone().subtract(2, 'days').unix() + t.tz_offset;
        marker_top /= (60*60*24);
        marker_top *= 20;

        var marker_style = {top: "calc(" + marker_top.toString() + "% - 5px)"};

        return <div key={e._id._str + "_marker_" + i.toString()} className="photo-marker" style={marker_style}></div>

      }, this);

      if (e.photos.length > 1) {
        // This should be its own react component
        return (
          <div key={e._id._str}>
          <div className="event" style={event_styles} onClick={() => this.goToCluster(e)}>
            <Cluster cluster={e} photos={photos_in_event} width={window.innerWidth * 0.8} height={window.innerHeight * cluster_height / 100}/>
          </div>
          {photo_markers}
          </div>);
      } else {
        return (<div key={e._id._str} >
          <div className="event-singleton" style={event_styles}>
            <Cluster cluster={e} photos={photos_in_event}/>
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

      // this should be its own react component
      date_grid.push(<DateBlock date={modified_date} />);
    }

    var CalendarButton = React.createClass({
    displayName: "ExampleCustomInput" ,

      propTypes: {
    onClick: React.PropTypes.func,
    value: React.PropTypes.string
    },

      render () {
    return (
    <button
    className="calendar-button-input"
    onClick={this.props.onClick}>
    <img src="/icons/Calendar-64.png" />
    </button>
    )
    }
    });

    return (
        <div className="cluster-root">
          <div className="nav">
            <div className="top">
              <button className="up" onClick={this.previousMonth.bind(this)}>
                <img src="/icons/doubleup.png" />
                <span className="hide">Previous month</span>
              </button>
              <button className="up" onClick={this.previous.bind(this)}>
                <img src="/icons/up.png" />
                <span className="hide">Previous day</span>
              </button>
            </div>
            <div className="middle">
              <DatePicker customInput={<CalendarButton />} selected={this.props.date} onChange={this.newDate.bind(this)} popoverAttachment="middle right" popoverTargetAttachment="middle left" popoverTargetOffset="0px 0px"/>
            </div>
            <div className="bottom">
              <button className="down" onClick={this.next.bind(this)}>
                <img src="/icons/down.png" />
                <span className="hide">Next day</span>
              </button>
              <button className="down" onClick={this.nextMonth.bind(this)}>
                <img src="/icons/doubledown.png" />
                <span className="hide">Next month</span>
              </button>
            </div>
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
