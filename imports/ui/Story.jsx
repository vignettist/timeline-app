import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import PhotoFaces from './PhotoFaces.jsx';
import { Photos, Stories } from '../api/photos.js';

export class Story extends Component {

  render() {
    console.log(this.props.stories);
    console.log(this.props.story_photos);

    if (FlowRouter.subsReady()) {
      let story = this.props.stories[0];
      let contentList = []

      for (var i = 0; i < story.content.length; i++) {
        if (story.content[i].type === 'text') {
          contentList.push(<p>{story.content[i].content}</p>);
        } else if (story.content[i].type === 'image') {
          let photo = this.props.story_photos.filter( function(photo) {
            console.log(photo._id.valueOf());
            console.log(story.content[i].content);
            return (photo._id.valueOf() === this.content[i].content);
          }, story);

          console.log(photo);

          if (photo.length === 1) {
            contentList.push(<PhotoFaces size="640" photos={photo} />);
          }
        }
      }

      return (
        <div id="story">
          <h2>{story.title}</h2>
          {contentList}
        </div>);
    } else {
      return <div>Loading</div>
    }
  }

 
}
 
Story.propTypes = {
  story_photos: PropTypes.array.isRequired,
  stories: PropTypes.array.isRequired,
};

export default createContainer(() => {
  return {
    story_photos: Photos.find({}).fetch(),
    stories: Stories.find({}).fetch()
  };

}, Story);
