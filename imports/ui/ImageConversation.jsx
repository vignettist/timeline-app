import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { LogicalImages } from '../api/photos.js';
import { People } from '../api/photos.js';
import PhotoFaces from './PhotoFaces.jsx';

function euclideanDistance(vec1, vec2) {
  if (vec1.length != vec2.length) {
    throw new Error("Cannot calculate distance between vectors of unequal length");
  }

  var sum = 0;
  for (var i = 0; i < vec1.length; i++) { sum += Math.pow(vec1[i] - vec2[i], 2); }
  return sum;
}

export class ImageConversation extends Component {
  constructor(props) {
      super(props);
  }

  componentDidMount() {

  }

  render() {
    if (FlowRouter.subsReady()) {

      var nfaces = this.props.photo[0].openfaces.length;
      var best_people = [];

      for (let facen = 0; facen < nfaces; facen++) {
        let face_rep = this.props.photo[0].openfaces[facen].rep;

        let min_sim = 10000;
        let best_person = '';

        for (var i = 0; i < this.props.people.length; i++) {
          var sim = euclideanDistance(this.props.people[i].median_rep, face_rep);

          if (sim < min_sim) {
            min_sim = sim;
            best_person = this.props.people[i];
          }
        }

        best_people[facen] = ({'score': min_sim, 'person': best_person});
      }

      people_summary = [];

      people_summary.push(
        <div>
          {'It looks like there are ' + nfaces + ' people in this image.'}
        </div>);

      for (let i = 0; i < nfaces; i++ ) {
        if (best_people[i]['score'] < 0.9) {
          people_summary.push(<div>{'That looks like ' + best_people[i]['person']['name'] + '.'}</div>);
        } else {
          people_summary.push(<div>I don't think I know that person.</div>)
        }
      }

      return (
        <div>
          <PhotoFaces photo={this.props.photo[0]} size={640} />
          <div>
            {people_summary}
          </div>
        </div>);

    } else {
      return (<div>Loading</div>);
    }

  }
}
 
ImageConversation.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photo: PropTypes.array.isRequired,
  people: PropTypes.array.isRequired,
  imageId: PropTypes.object.isRequired,
};

export default createContainer(() => {
  return {
    people: People.find({}).fetch(),
    photo: LogicalImages.find({}).fetch()
  };

}, ImageConversation);