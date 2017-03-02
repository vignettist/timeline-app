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

export class Compose extends Component {
	constructor(props) {
        super(props);

        this.state = {
          selectingImage: false,
        };
    }

	insertNewContent(position, contentType) {
		if (contentType === 'add-header') {
			Meteor.call('story.insertHeader', this.props.story[0]._id, position+1);
			this.setState({'selectingImage': false});
		} else if (contentType === 'add-text') {
			Meteor.call('story.insertParagraph', this.props.story[0]._id, position+1);
			this.setState({'selectingImage': false});
		} else if (contentType === 'add-image') {
			this.setState({'selectingImage': true, 'newImagePosition': position+1});
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

	deleteImage(position) {
		// delete the image by updating text with ""
		Meteor.call('story.updateText', this.props.story[0]._id, position, "");
	}

	render() {
		var composeContent = [];

		if (this.props.story.length > 0) {
			var story = this.props.story[0].content;

			for (var i = 0; i < story.length; i++) {
				if (story[i].type === 'heading') {
					composeContent.push(<StoryHeading ref={"story_" + this.props.story[0]._id + "_heading_" + i}
													  html={story[i].data}
													  onChange={this.updateText.bind(this, i)} />);
				} else if (story[i].type === 'paragraph') {
					composeContent.push(<StoryParagraph ref={"story_" + this.props.story[0]._id + "_paragraph_" + i}
														html={story[i].data} 
														onChange={this.updateText.bind(this, i)} />);
					
				} else if (story[i].type === 'image') {
					composeContent.push(<StoryImage ref={"story_" + this.props.story[0]._id + "_image_" + i} 
													uri={"http://localhost:3022/" + story[i].data.resized_uris[1280]}
													callback={this.deleteImage.bind(this, i)} />);
				}

				composeContent.push(<AddButton key={"add_button_" + i + this.props.story[0]._id} callback={this.insertNewContent.bind(this, i)} />);
			}

			if (this.state.selectingImage) {
				var strip = <TimelineStrip closeCallback={this.cancelPhotoInsert.bind(this)} displayRejects={false} displayRating={false} photos={this.props.photos} highlighted={[]} callback={this.photoCallback.bind(this)} />;
			} else {
				var strip = [];
			}

			return  <div className="compose-wrapper">
						{strip}
						<div className={"compose-story" + (this.state.selectingImage ? " picker-active" : "")}>
						{composeContent}
						</div>
					</div>
		} else {
			return <div className="compose-wrapper">
					<div className="compose-story">
					<div className="heading loading"><h1>Generating story...</h1></div>
					</div>
					</div>
		}
	}
}

Compose.propTypes = {
  conversation: PropTypes.object.isRequired,
  cluster: PropTypes.object.isRequired,
  photos: PropTypes.object.isRequired,
  places: PropTypes.array.isRequired,
  story: PropTypes.object.isRequired
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

