import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Clusters, LogicalImages, Places, Stories} from '../api/photos.js';
import {Conversations} from '../api/conversation.js';
import AddButton from './AddButton.jsx';
// import {Stories} from '../api/stories.js';
import TimelineStrip from './TimelineStrip.jsx';
import StoryParagraph from './StoryParagraph.jsx';
import StoryHeading from './StoryHeading.jsx';
import StoryImage from './StoryImage.jsx';
import StoryMap from './StoryMap.jsx';
import UserBar from './UserBar.jsx';

export class Compose extends Component {
	constructor(props) {
        super(props);

        this.state = {
          selectingImage: false,
          newInsertion: -1
        };
    }

	insertNewContent(position, contentType) {
		if (contentType === 'add-header') {
			Meteor.call('story.insertHeader', this.props.story[0]._id, position);
			this.setState({'selectingImage': false, 'newInsertion': position});
		} else if (contentType === 'add-text') {
			Meteor.call('story.insertParagraph', this.props.story[0]._id, position);
			this.setState({'selectingImage': false, 'newInsertion': position});
		} else if (contentType === 'add-image') {
			this.setState({'selectingImage': true, 'newImagePosition': position});
		} else if (contentType === "add-map") {
			Meteor.call('story.insertMap', this.props.story[0]._id, position);
			this.setState({'selectingImage': false});
		}
	}

	photoCallback(photo) {
		Meteor.call('story.insertImage', this.props.story[0]._id, photo, this.state.newImagePosition);
		this.setState({'selectingImage': false});
	}

	cancelPhotoInsert() {
		this.setState({'selectingImage': false});
	}

	updateText(position, event) {
		Meteor.call('story.updateText', this.props.story[0]._id, position, event.target.value);
	}

	updateTitle(event) {
	    Meteor.call('conversation.setTitle', this.props.cluster[0]._id._str, event.target.value);
	}

	updateMapBounds(position, bounds) {
		// this can be finicky with regards to resetting bounds
		Meteor.call('story.updateMapBounds', this.props.story[0]._id, position, bounds);
	}

	deleteImage(position) {
		// delete the image by updating text with ""
		Meteor.call('story.updateText', this.props.story[0]._id, position, "");
	}

	back() {
		FlowRouter.go('/conversation/' + this.props.cluster[0]._id._str);
	}

	render() {
		var composeContent = [];

		if (FlowRouter.subsReady()) {
			var story = this.props.story[0].content;

			var corrected_time = moment(this.props.cluster[0].start_time.utc_timestamp).utcOffset(this.props.cluster[0].start_time.tz_offset/60);
			var initial_title = corrected_time.format('MMMM Do YYYY');
			composeContent.push(<StoryHeading ref={"story_" + this.props.story[0]._id + "_title"}
											  key={"story_" + this.props.story[0]._id + "_title"}
										      html={('title' in this.props.cluster[0]) ? this.props.cluster[0].title : initial_title }
											  onChange={this.updateTitle.bind(this)}
											  isTitle={true} />);

			for (var i = 0; i < story.length; i++) {
				composeContent.push(<AddButton key={"add_button_" + i + this.props.story[0]._id} callback={this.insertNewContent.bind(this, i)} />);

				if (story[i].type === 'heading') {
					composeContent.push(<StoryHeading ref={"story_" + this.props.story[0]._id + "_heading_" + i}
													  key={"story_" + this.props.story[0]._id + "_heading_" + i}
													  html={story[i].data}
													  onChange={this.updateText.bind(this, i)}
													  isTitle={false}
													  selected={i == this.state.newInsertion}/>);

				} else if (story[i].type === 'paragraph') {
					composeContent.push(<StoryParagraph ref={"story_" + this.props.story[0]._id + "_paragraph_" + i}
														key={"story_" + this.props.story[0]._id + "_paragraph_" + i}
														html={story[i].data} 
														onChange={this.updateText.bind(this, i)} 
														selected={i == this.state.newInsertion}/>);
					
				} else if (story[i].type === 'image') {
					composeContent.push(<StoryImage ref={"story_" + this.props.story[0]._id + "_image_" + i} 
													key={"story_" + this.props.story[0]._id + "_image_" + i} 
													uri={"http://localhost:3022/" + Meteor.user().username + '/' + story[i].data.resized_uris[1280]}
													callback={this.deleteImage.bind(this, i)} />);
				} else if (story[i].type === 'map') {
					if ('bounds' in story[i]) {
						composeContent.push(<StoryMap ref={"story_" + this.props.story[0]._id + "_map_" + i}
												  key={"story_" + this.props.story[0]._id + "_map_" + i}
												  cluster={this.props.cluster[0]}
												  photos={this.props.photos}
												  deleteCallback={this.deleteImage.bind(this, i)} 
												  callback={this.updateMapBounds.bind(this, i)} 
												  bounds={story[i].bounds} />);
					} else {
						composeContent.push(<StoryMap ref={"story_" + this.props.story[0]._id + "_map_" + i}
												  key={"story_" + this.props.story[0]._id + "_map_" + i}
												  cluster={this.props.cluster[0]}
												  photos={this.props.photos}
												  deleteCallback={this.deleteImage.bind(this, i)} 
												  callback={this.updateMapBounds.bind(this, i)} />);
					}
				}
			}

			composeContent.push(<AddButton key={"add_button_" + i + this.props.story[0]._id} callback={this.insertNewContent.bind(this, i+1)} />);

			if (this.state.selectingImage) {
				var strip = <TimelineStrip closeCallback={this.cancelPhotoInsert.bind(this)} displayRejects={false} displayRating={false} photos={this.props.photos} highlighted={[]} callback={this.photoCallback.bind(this)} />;
			} else {
				var strip = [];
			}

			return  <div className="compose-wrapper">
						<UserBar />
						<button className={"back-button" + (this.state.selectingImage ? " picker-active" : "")} onClick={this.back.bind(this)}><img src="/icons/back.png" /><div>Back</div></button>
						{strip}
						<div className={"compose-story" + (this.state.selectingImage ? " picker-active" : "")}>
						{composeContent}
						</div>
					</div>
		} else {
			return <div className="compose-wrapper">
					<UserBar />
					<div className="compose-story">
					<div className="heading loading"><h1>Generating story...</h1></div>
					</div>
					</div>
		}
	}
}

Compose.propTypes = {
  conversation: PropTypes.array.isRequired,
  cluster: PropTypes.array.isRequired,
  photos: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  story: PropTypes.array.isRequired
};

export default createContainer(() => {
  return {
    conversation: Conversations.find({}).fetch(),
    cluster: Clusters.find({}).fetch(),
    photos: LogicalImages.find({}).fetch(),
    places: Places.find({}).fetch(),
    story: Stories.find({}).fetch()
  };

}, Compose);

