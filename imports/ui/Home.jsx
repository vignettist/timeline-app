import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Clusters, People, Places, Stories} from '../api/photos.js';
import {Conversations} from '../api/conversation.js';
import UserBar from './UserBar.jsx';

export class Home extends Component {
	constructor(props) {
        super(props);

        this.state = {
        	nohiding: true
        };
    }

    goToTimeline() {
    	console.log('gototimeline');
    	this.setState({nohiding: false});
    	FlowRouter.go('/clusters/2017-05-20');
    }

    goToMap() {
    	FlowRouter.go('/overview');
    }

    goToPeople() {
    	console.log('goToPeople');
    }

    goToStory(story) {
    	FlowRouter.go('/compose/' + story);
    	
    }

	render() {
		var story_dom = [];
		var stories = this.props.stories;

		var story_clusters = this.props.clusters.filter(function(c) { return 'location' in c});

		for (var i = 0; i < story_clusters.length; i++) {
			for (var j = 0; j < stories.length; j++) {
				if (stories[j].cluster_id._str === story_clusters[i]._id._str) {
					stories[j].cluster = story_clusters[i];
				}
			}
		}

		for (var i = 0; i < stories.length; i++) {
			if ('title' in stories[i].cluster) {
				var title = <span className="title">{stories[i].cluster.title}</span>;	
			} else {
				var corrected_time = moment(stories[i].cluster.start_time.utc_timestamp).utcOffset(stories[i].cluster.start_time.tz_offset/60);
        		var initial_title = corrected_time.format('MMMM Do YYYY') + " in " + stories[i].cluster.location;

				var title = <span className="title unnamed">{initial_title}</span>;
			}


			story_dom.push(<div className="story" onClick={this.goToStory.bind(this, stories[i].cluster_id)} style={{backgroundImage: 'url(http://localhost:3022/' + Meteor.user().username + '/' + stories[i].cluster.top_images[0].resized_uris['640'] + ')'}}>
				{title}
				</div>)
		}

		return <div className="home-root">
			<UserBar nohiding={this.state.nohiding}/>
			<h1>Vignette</h1>

			<div className="pages">
				<div className="page" onClick={this.goToTimeline.bind(this)}>
					<img className="icon" src="/icons/calendar.png" />
					Timeline
				</div>

				<div className="page" onClick={this.goToMap.bind(this)}>
					<img className="icon" src="/icons/map.png" />
					Map
				</div>

				<div className="page" onClick={this.goToPeople.bind(this)}>
					<img className="icon" src="/icons/people.png" />
					People
				</div>
			</div>

			<h2>Recent stories</h2>
			<div className="stories">
				{story_dom}
			</div>
		</div>
	}
}

Home.propTypes = {
  clusters: PropTypes.array.isRequired,
  people: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  stories: PropTypes.array.isRequired
};

export default createContainer(() => {
  return {
    clusters: Clusters.find({}).fetch(),
    people: People.find({}).fetch(),
    places: Places.find({}).fetch(),
    stories: Stories.find({}).fetch()
  };

}, Home);

