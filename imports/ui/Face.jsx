import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { LogicalImages } from '../api/photos.js';

var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

export class Face extends Component {
  constructor(props) {
      super(props);
  }

  componentDidMount() {

  }

  render() {
    console.log(this.props.photo);

    if (this.props.photo.length > 0) {

      let original_photo = this.props.photo.filter(function(i) {
        return (i._id._str == this.props.imageId._str);
      }, this);

      let other_photos = this.props.photo.filter(function(i) {
        return (i._id._str != this.props.imageId._str);
      }, this);

      // resort on the client side
      var face = original_photo[0].openfaces[this.props.facen].rep;
      var similarity = [];

      for (var i = 0; i < other_photos.length; i++) {
        var sims = [];

        for (var k = 0; k < other_photos[i].openfaces.length; k++) {
          var sim = 0;
          for (var j = 0; j < other_photos[i].openfaces[k].rep.length; j++) {
            sim += Math.pow(other_photos[i].openfaces[k].rep[j] - face[j],2);
          }
          sims.push(sim);
        }
        console.log(sims);
        var sim = Math.min.apply(null, sims);
        console.log(sim);

        similarity.push({'similarity': sim, 'photo': other_photos[i]});
      }

      let sorted_photos = similarity.sort(function(a, b) { return a.similarity - b.similarity});

      let photos = sorted_photos.map(function(img) {        
            return (<div className="bigImage">
                <img key={img.photo._id + "_img"} src={"http://localhost:3022/" + img.photo.resized_uris["640"]} />
                {img.similarity}
            </div> );
          });

      return (<div>
                <div className="bigImage">
                  <img src={"http://localhost:3022/" + original_photo[0].resized_uris["1280"]} />
                </div>
                {photos}
              </div>          
          );       
    } else {
      return <div>Loading.</div>
    }
  }
}
 
Face.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photo: PropTypes.array.isRequired,
  imageId: PropTypes.object.isRequired,
  facen: PropTypes.number.isRequired
};

export default createContainer(() => {
  return {
    photo: LogicalImages.find({}).fetch(),
  };

}, Face);