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

function makeAndList(list, n, i, a) {
	if (i == a.length - 1) {
		return list + " and " + n;
	} else {
		return list + ", " + n;
	}
}

export {makeAndList};

function listOfItems(names) {
	var people_string = '';
	if (names.length == 1) {
		people_string = names[0];
	} else {
		for (var i = 0; i < names.length - 1; i++) {
			if (i != 0) {
				people_string += ", "
			}
			people_string += names[0]
		}
		people_string += " and " + names[names.length-1];
	}

	return people_string;
}

export {listOfItems};

// changes pronouns from first person to second person
function reversePronouns(text) {
	text = text.replace(/\bour\b/g, "your");
	text = text.replace(/\bOur\b/g, "Your");	
	text = text.replace(/\bours\b/g, "yours");
	text = text.replace(/\bOurs\b/g, "Yours");
	text = text.replace(/\bus\b/g, "you");
	text = text.replace(/\bUs\b/g, "You");
	text = text.replace(/\bwe\b/g, "you");
	text = text.replace(/\bWe\b/g, "You");
	text = text.replace(/\bourselves\b/g, "yourselves");
	text = text.replace(/\bOurselves\b/g, "Yourselves");
	text = text.replace(/\bI\b/g, "you");
	text = text.replace(/\bi\b/g, "you");
	text = text.replace(/\bme\b/g, "you");
	text = text.replace(/\bMe\b/g, "You");
	text = text.replace(/\bmy\b/g, "your");
	text = text.replace(/\bMy\b/g, "Your");
	text = text.replace(/\bmine\b/g, "yours");
	text = text.replace(/\bMine\b/g, "Yours");
	text = text.replace(/\bmyself\b/g, "yourself");
	text = text.replace(/\bMyself\b/g, "Yourself");
	text = text.replace(/\bam\b/g, "are");
	text = text.replace(/\bAm\b/g, "Are");
	text = text.replace(/\bwas\b/g, "were");
	text = text.replace(/\bWas\b/g, "Were");
	return text;
}

export {reversePronouns};

function definiteArticles(text) {
	text = text.replace(/\ba\b/g, "the");
	text = text.replace(/\bA\b/g, "The");
	text = text.replace(/\ban\b/g, "the");
	text = text.replace(/\bAn\b/g, "The");
	return text;
}

export {definiteArticles};