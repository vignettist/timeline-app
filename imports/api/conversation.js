import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';
import { check } from 'meteor/check';

export const Conversations = new Mongo.Collection('conversations');

Meteor.methods({
	'conversation.whoIs'(responseText) {
  		check(responseText, String);
  		this.unblock();
		try {
			var result = HTTP.call("POST", "http://localhost:3050/parse",
		                       {params: {text: responseText}});
			return JSON.parse(result.content);
		} catch (e) {
			console.log(e);
			// Got a network error, time-out or HTTP error in the 400 or 500 range.
			return false;
		}
	}
});