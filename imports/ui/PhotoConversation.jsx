import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

export default class Photo extends Component {
    constructor(props) {
        super(props);

        this.state = {
          parse_tree: ''
        }
    }

    handleSubmit(event) {
      event.preventDefault();

      const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

      Meteor.call('conversation.whoIs', text, (err, res) => {
        if (err) {
          alert(err);
        } else {
          var parse_tree = ''
          if (res.document.sentences.sentence.length > 1) {
            for( var i = 0; i < res.document.sentences.sentence.length; i++) {
              parse_tree += res.document.sentences.sentence[i].parse;
            }
          } else {
            parse_tree = res.document.sentences.sentence.parse;
          }


          this.setState({parse_tree: parse_tree});
        }
      });
    }

  render() {

    if (this.state.parse_tree.length > 0) {
      var response = this.state.parse_tree;
    } else {
      var response = <form className="conversational-ui" onSubmit={this.handleSubmit.bind(this)} >
            <input
              type="text"
              ref="textInput"
              placeholder="This is my friend..."
            />
          </form>;
    }

    if (this.props.photo.openfaces.length > 0) {
      return <div className="cluster-debug-conversation">
        <div className="conversation computer-side">
          Who is in this photo?
        </div>
        <div className="conversation human-side">
          {response}
        </div>
        </div>
    } else {
      return <div className="cluster-debug-conversation">
        There are no faces!
        </div>
    }
  }
}
 
Photo.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photo: PropTypes.object.isRequired
};
