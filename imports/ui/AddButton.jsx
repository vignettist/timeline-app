import React, { Component, PropTypes } from 'react';

export default class AddButton extends Component {
	constructor(props) {
        super(props);

        this.state = {
          active: false
        };
    }

    setActive() {
    	this.setState({active: true});
    }

    inactive() {
    	this.setState({active: false});
    }

    handleCallback(event) {
    	this.props.callback(event.target.className);
    }

	render() {
		if (this.state.active) {
			return <div className="divider active">
					<div className="add" onMouseLeave={this.inactive.bind(this)}>
						<button className="add-text" onClick={this.handleCallback.bind(this)}>
							<img className="add-text" src="/icons/Add Text Filled-100.png" />
						</button>
						<button className="add-image" onClick={this.handleCallback.bind(this)}>
							<img className="add-image" src="/icons/Picture-100.png" />
						</button>
						<button className="add-map" onClick={this.handleCallback.bind(this)}>
							<img className="add-map" src="/icons/map.png" />
						</button>
						<button className="add-header" onClick={this.handleCallback.bind(this)}>
							<img className="add-header" src="/icons/Header 1-100.png" />
						</button>
					</div>
				</div>
		} else {
			return <div className="divider">
					<div className="add">
						<img onMouseDown={this.setActive.bind(this)} src="/icons/Plus-100.png" />
					</div>
				</div>
		}
	}
}

AddButton.propTypes = {
	callback: PropTypes.func.isRequired
};