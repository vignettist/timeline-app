function chooseRandomResponse(responses) {
	var i = Math.floor(responses.length * Math.random());
	return responses[i];
}

export {chooseRandomResponse};

function makeList(list, n, i, a) {
	if (i == a.length - 1) {
		return list + " or " + n;
	} else {
		return list + ", " + n;
	}
}

export {makeList};

// changes pronouns from first person to second person
function reversePronouns(text) {
	text = text.replace(/\bour\b/, "your");
	text = text.replace(/\bOur\b/, "Your");	
	text = text.replace(/\bours\b/, "yours");
	text = text.replace(/\bOurs\b/, "Yours");
	text = text.replace(/\bus\b/, "you");
	text = text.replace(/\bUs\b/, "You");
	text = text.replace(/\bwe\b/, "you");
	text = text.replace(/\bWe\b/, "You");
	text = text.replace(/\bourselves\b/, "yourselves");
	text = text.replace(/\bOurselves\b/, "Yourselves");
	text = text.replace(/\bI\b/, "you");
	text = text.replace(/\bi\b/, "you");
	text = text.replace(/\bme\b/, "you");
	text = text.replace(/\bMe\b/, "You");
	text = text.replace(/\bmy\b/, "your");
	text = text.replace(/\bMy\b/, "Your");
	text = text.replace(/\bmine\b/, "yours");
	text = text.replace(/\bMine\b/, "Yours");
	text = text.replace(/\bmyself\b/, "yourself");
	text = text.replace(/\bMyself\b/, "Yourself");
	text = text.replace(/\bam\b/, "are");
	text = text.replace(/\bAm\b/, "Are");
	text = text.replace(/\bwas\b/, "were");
	text = text.replace(/\bWas\b/, "Were");
	return text;
}

export {reversePronouns};

function definiteArticles(text) {
	text = text.replace(/\ba\b/, "the");
	text = text.replace(/\bA\b/, "The");
	text = text.replace(/\ban\b/, "the");
	text = text.replace(/\bAn\b/, "The");
	return text;
}

export {definiteArticles};