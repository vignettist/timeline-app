import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import TextMessage from './Conversation/TextMessage.jsx';
import TextInputMessage from './Conversation/TextInputMessage.jsx';

export default class PhotoConversation extends Component {
    constructor(props) {
        super(props);

        this.state = {
          conversationHistory: [{from: 'app', content: 'Who is in this photo?'}],
          promptText: 'This is my friend...'
        }
    }

    addResponse(r) {
      var newHistory = this.state.conversationHistory;
      newHistory.push(r);
      this.setState({conversationHistory: newHistory});
    }

    handleSubmit(event) {
      event.preventDefault();

      var inputBox = ReactDOM.findDOMNode(this.refs.textInput.refs.textInput);
      const text = inputBox.value.trim();
      inputBox.value = '';

      this.addResponse({from: 'user', content: text});
      this.setState({promptText: ''});

      Meteor.call('conversation.whoIs', text, (err, res) => {
        if (err) {
          alert(err);
        } else {
          this.addResponse({from: 'app', content: res});
        }
      });
    }

  render() {

    var human_input = <div className="conversation input human-side">
        <form className="conversational-ui" onSubmit={this.handleSubmit.bind(this)} >
          <input
            type="text"
            ref="textInput"
            placeholder={this.state.promptText}
          />
        </form>
        </div>;

    if (this.props.photo.openfaces.length > 0) {
      var conversation = this.state.conversationHistory.map(function(m) {
        if (m.from == 'app') {
          return <TextMessage idTag="computer-side" content={m.content} />
        } else {
          return <TextMessage idTag="human-side" content={m.content} />
        }
      });


      return <div className="cluster-debug-conversation">
          {conversation}
          <TextInputMessage ref="textInput" onSubmit={this.handleSubmit.bind(this)} placeholder={this.state.promptText} />
        </div>
    } else {
      return <div className="cluster-debug-conversation">
        There are no faces!
        </div>
    }
  }
}
 
PhotoConversation.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  photo: PropTypes.object.isRequired
};
