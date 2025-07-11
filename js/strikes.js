window.onload = function() {
	const params = new Proxy(new URLSearchParams(window.location.search), {
	  get: (searchParams, prop) => searchParams.get(prop),
	});

	if (params.tourney1 !== null) 
	{
		let tourneyParams = params.tourney1.split(",");
		if (tourneyParams.length >= 5) 
		{
			document.getElementById("strikes").value = tourneyParams[4];
			document.getElementById("playerCount").value = tourneyParams[1];
			document.getElementById("playersLeft").value = tourneyParams[2];
			qualifyQuestion();
			document.getElementById("groupCount").value = tourneyParams[3];
			let strikeFormat = tourneyParams[0];
			if (strikeFormat === "F") document.getElementById("commonFormats").value = 1;
			else if (strikeFormat === "P") document.getElementById("commonFormats").value = 2;
			else if (strikeFormat === "1") document.getElementById("commonFormats").value = 3;
			else if (strikeFormat === "L") document.getElementById("commonFormats").value = 4;
			else if (strikeFormat === "S") document.getElementById("commonFormats").value = 5;
			else if (strikeFormat === "O") document.getElementById("commonFormats").value = 6;
			else document.getElementById("commonFormats").value = 1;
			fillStrikes();

			if (tourneyParams.length >= 14)
			{
				var strikeTexts = document.getElementsByName('strikes[]');
				for (let i = 0; i < 9; i++) {
					strikeTexts[i].value = tourneyParams[5 + i];
				}
			}
		}
		
		if (params.bye !== null) {
			tourneyParams = params.bye.split(",");
			if (tourneyParams.length >= 4) 
			{
				document.getElementById("byeQuestion").checked = true;
				byeQuestion();
				document.getElementById("byePlayers1").value = tourneyParams[0];
				document.getElementById("byeQuestion2").checked = (tourneyParams[1] === 't');
				byeQuestion2();
				document.getElementById("byePlayers2").value = tourneyParams[2];
				document.getElementById("byeStrikes2").value = tourneyParams[3];
				document.getElementById("byeStrikes3").value = tourneyParams[4];
			}
		}

		if (params.tourney2 !== null) {
			tourneyParams = params.tourney2.split(",");
			if (tourneyParams.length >= 4) 
			{
				document.getElementById("finalsQuestion").checked = true;
				qualifyQuestion2();
				document.getElementById("strikes2").value = tourneyParams[3];
				document.getElementById("groupCount2").value = tourneyParams[2];
				document.getElementById("exactPlayers").checked = (tourneyParams[0] === 't');
				let strikeFormat = tourneyParams[1];
				if (strikeFormat === "F") document.getElementById("commonFormats-f").value = 1;
				else if (strikeFormat === "P") document.getElementById("commonFormats-f").value = 2;
				else if (strikeFormat === "1") document.getElementById("commonFormats-f").value = 3;
				else if (strikeFormat === "L") document.getElementById("commonFormats-f").value = 4;
				else if (strikeFormat === "S") document.getElementById("commonFormats-f").value = 5;
				else if (strikeFormat === "O") document.getElementById("commonFormats-f").value = 6;
				else document.getElementById("commonFormats-f").value = 1;
				fillStrikesF();

				if (tourneyParams.length >= 13)
				{
					var strikeTexts = document.getElementsByName('strikesF[]');
					for (let i = 0; i < 9; i++) {
						strikeTexts[i].value = tourneyParams[4 + i];
					}
				}
			}
		}
		
		if (tourneyParams.length >= 5) tgpButton();
	}
}

class Player {
	constructor(id, topScore, strikes) {
		this.id = id;
		this.topScore = topScore;
		this.strikes = strikes;
		this.score = 0;
	}
}

function byeQuestion() {
	if (document.getElementById("byeQuestion").checked) {
		document.getElementById("bye1").style.display = 'block';
	} else {
		document.getElementById("bye1").style.display = 'none';
	}
}

function byeQuestion2() {
	if (document.getElementById("byeQuestion2").checked) {
		document.getElementById("bye2").style.display = 'block';
	} else {
		document.getElementById("bye2").style.display = 'none';
	}
}

function qualifyQuestion() {
	let finalPlayers = parseInt(document.getElementById("playersLeft").value);
	if (finalPlayers > 1)
		document.getElementById("finals").style.display='block';
	else {
		document.getElementById("finals").style.display='none';
		document.getElementById("finals2").style.display='none';
		document.getElementById("finalsQuestion").checked = false;
	}
		
}

function qualifyQuestion2() {
	if (document.getElementById("finalsQuestion").checked) {
		document.getElementById("commonFormats-f").value = document.getElementById("commonFormats").value;
		document.getElementById("p21-f").value = document.getElementById("p21").value;
		document.getElementById("p22-f").value = document.getElementById("p22").value;
		document.getElementById("p31-f").value = document.getElementById("p31").value;
		document.getElementById("p32-f").value = document.getElementById("p32").value;
		document.getElementById("p33-f").value = document.getElementById("p33").value;
		document.getElementById("p41-f").value = document.getElementById("p41").value;
		document.getElementById("p42-f").value = document.getElementById("p42").value;
		document.getElementById("p43-f").value = document.getElementById("p43").value;
		document.getElementById("p44-f").value = document.getElementById("p44").value;
		document.getElementById("finals2").style.display='block';
	} else {
		document.getElementById("finals2").style.display='none';
	}
}

function fillStrikes() {
	let value = document.getElementById("commonFormats").value;
	if (value === "1") 
	{
		document.getElementById("p21").value = 0; document.getElementById("p22").value = 2;
		document.getElementById("p31").value = 0; document.getElementById("p32").value = 1; document.getElementById("p33").value = 2;
		document.getElementById("p41").value = 0; document.getElementById("p42").value = 1; document.getElementById("p43").value = 1; document.getElementById("p44").value = 2;
	}
	else if (value === "2")
	{
		document.getElementById("p21").value = 0; document.getElementById("p22").value = 1; 
		document.getElementById("p31").value = 0; document.getElementById("p32").value = 1; document.getElementById("p33").value = 2;
		document.getElementById("p41").value = 0; document.getElementById("p42").value = 1; document.getElementById("p43").value = 2; document.getElementById("p44").value = 3;
	}
	else if (value === "3")
	{
		document.getElementById("p21").value = 0; document.getElementById("p22").value = 1;
		document.getElementById("p31").value = 0; document.getElementById("p32").value = 0; document.getElementById("p33").value = 1;
		document.getElementById("p41").value = 0; document.getElementById("p42").value = 0; document.getElementById("p43").value = 0; document.getElementById("p44").value = 1;
	}
	else if (value === "4")
	{
		document.getElementById("p21").value = 0; document.getElementById("p22").value = 1;
		document.getElementById("p31").value = 0; document.getElementById("p32").value = 0; document.getElementById("p33").value = 1;
		document.getElementById("p41").value = 0; document.getElementById("p42").value = 0; document.getElementById("p43").value = 1; document.getElementById("p44").value = 1;
	}
	else if (value === "5")
	{
		document.getElementById("p21").value = 0; document.getElementById("p22").value = 1;
		document.getElementById("p31").value = 0; document.getElementById("p32").value = 1; document.getElementById("p33").value = 1;
		document.getElementById("p41").value = 0; document.getElementById("p42").value = 0; document.getElementById("p43").value = 1; document.getElementById("p44").value = 1;
	}
	else if (value === "6")
	{
		document.getElementById("p21").value = 0; document.getElementById("p22").value = 1;
		document.getElementById("p31").value = 0; document.getElementById("p32").value = 1; document.getElementById("p33").value = 1;
		document.getElementById("p41").value = 0; document.getElementById("p42").value = 1; document.getElementById("p43").value = 1; document.getElementById("p44").value = 1;
	}
}

function fillStrikesF() {
	let value = document.getElementById("commonFormats-f").value;
	if (value === "1") 
	{
		document.getElementById("p21-f").value = 0; document.getElementById("p22-f").value = 2;
		document.getElementById("p31-f").value = 0; document.getElementById("p32-f").value = 1; document.getElementById("p33-f").value = 2;
		document.getElementById("p41-f").value = 0; document.getElementById("p42-f").value = 1; document.getElementById("p43-f").value = 1; document.getElementById("p44-f").value = 2;
	}
	else if (value === "2")
	{
		document.getElementById("p21-f").value = 0; document.getElementById("p22-f").value = 1; 
		document.getElementById("p31-f").value = 0; document.getElementById("p32-f").value = 1; document.getElementById("p33-f").value = 2;
		document.getElementById("p41-f").value = 0; document.getElementById("p42-f").value = 1; document.getElementById("p43-f").value = 2; document.getElementById("p44-f").value = 3;
	}
	else if (value === "3")
	{
		document.getElementById("p21-f").value = 0; document.getElementById("p22-f").value = 1;
		document.getElementById("p31-f").value = 0; document.getElementById("p32-f").value = 0; document.getElementById("p33-f").value = 1;
		document.getElementById("p41-f").value = 0; document.getElementById("p42-f").value = 0; document.getElementById("p43-f").value = 0; document.getElementById("p44-f").value = 1;
	}
	else if (value === "4")
	{
		document.getElementById("p21-f").value = 0; document.getElementById("p22-f").value = 1;
		document.getElementById("p31-f").value = 0; document.getElementById("p32-f").value = 0; document.getElementById("p33-f").value = 1;
		document.getElementById("p41-f").value = 0; document.getElementById("p42-f").value = 0; document.getElementById("p43-f").value = 1; document.getElementById("p44-f").value = 1;
	}
	else if (value === "5")
	{
		document.getElementById("p21-f").value = 0; document.getElementById("p22-f").value = 1;
		document.getElementById("p31-f").value = 0; document.getElementById("p32-f").value = 1; document.getElementById("p33-f").value = 1;
		document.getElementById("p41-f").value = 0; document.getElementById("p42-f").value = 0; document.getElementById("p43-f").value = 1; document.getElementById("p44-f").value = 1;
	}
	else if (value === "6")
	{
		document.getElementById("p21-f").value = 0; document.getElementById("p22-f").value = 1;
		document.getElementById("p31-f").value = 0; document.getElementById("p32-f").value = 1; document.getElementById("p33-f").value = 1;
		document.getElementById("p41-f").value = 0; document.getElementById("p42-f").value = 1; document.getElementById("p43-f").value = 1; document.getElementById("p44-f").value = 1;
	}
}

function calcKnockoutTournament(players, groupCount, finalPlayers) {	
	let finalStrikes1 = parseInt(document.getElementById("strikes").value);
	let finalStrikes2 = parseInt(document.getElementById("strikes2").value);
	let strikeDist = [ 
		[ parseInt(document.getElementById("p21").value), parseInt(document.getElementById("p22").value), parseInt(document.getElementById("p22").value), parseInt(document.getElementById("p22").value)], 
		[ parseInt(document.getElementById("p31").value), parseInt(document.getElementById("p32").value), parseInt(document.getElementById("p33").value), parseInt(document.getElementById("p33").value)], 
		[ parseInt(document.getElementById("p41").value), parseInt(document.getElementById("p42").value), parseInt(document.getElementById("p43").value), parseInt(document.getElementById("p44").value)]
	];
	
	let strikeDist2 = [ 
		[ parseInt(document.getElementById("p21-f").value), parseInt(document.getElementById("p22-f").value), parseInt(document.getElementById("p22-f").value), parseInt(document.getElementById("p22-f").value)], 
		[ parseInt(document.getElementById("p31-f").value), parseInt(document.getElementById("p32-f").value), parseInt(document.getElementById("p33-f").value), parseInt(document.getElementById("p33-f").value)], 
		[ parseInt(document.getElementById("p41-f").value), parseInt(document.getElementById("p42-f").value), parseInt(document.getElementById("p43-f").value), parseInt(document.getElementById("p44-f").value)]
	];

	let roundResult1 = [];
	let finalEndPlayers1 = [];
	let playerGames1 = [ 0, 0, 0 ];

	let roundResult2 = [];
	let finalEndPlayers2 = [];
	let playerGames2 = [ 0, 0, 0 ];
	let iterations = 10000;
	let distribution = [];

	for (let h = 0; h < iterations; h++)
	{
		let survivingPlayers = runTournament(players, groupCount, finalStrikes1, finalPlayers, playerGames1, roundResult1, strikeDist, distribution);
		
		finalEndPlayers1.push(survivingPlayers);
		
		if (document.getElementById("finalsQuestion").checked) {
			if (document.getElementById("exactPlayers").checked) {
				let survivingPlayers2 = runTournament(finalPlayers, groupCount, finalStrikes2, 1, playerGames2, roundResult2, strikeDist2);
				finalEndPlayers2.push(survivingPlayers2);
			} else {
				let survivingPlayers2 = runTournament(survivingPlayers, groupCount, finalStrikes2, 1, playerGames2, roundResult2, strikeDist2);
				finalEndPlayers2.push(survivingPlayers2);
			}
		}
	}

	let roundAvg = average(roundResult1);
	let endPlayersAvg = average(finalEndPlayers1);
	let totalGames = playerGames1[0] + playerGames1[1] + playerGames1[2];
	let totalTGP = playerGames1[0] + (1.5 * playerGames1[1]) + (2 * playerGames1[2]);
	let pct5 = parseInt(iterations * 0.05);
	let pct95 = parseInt(iterations * 0.95);
	roundResult1.sort(function(a, b) {
		return a - b;
	});
	finalEndPlayers1.sort(function(a, b) {
		return a - b;
	});

	document.getElementById("2pGames").innerHTML = (playerGames1[0] / iterations).toFixed(2);
	document.getElementById("3pGames").innerHTML = (playerGames1[1] / iterations).toFixed(2);
	document.getElementById("4pGames").innerHTML = (playerGames1[2] / iterations).toFixed(2);
	document.getElementById("TotalGames").innerHTML = (totalGames / iterations).toFixed(2);
	document.getElementById("MeaningfulGames").innerHTML = (roundAvg * totalTGP / totalGames).toFixed(2);
	if (document.getElementById("finalsQuestion").checked) {
		document.getElementById("ApproxTGP").innerHTML = (roundAvg * totalTGP / totalGames * 4).toFixed(2) + "%";
	} else {
		document.getElementById("ApproxTGP").innerHTML = (roundAvg * totalTGP / totalGames * 4 > 100 ? "100.00% (maxed - " + (roundAvg * totalTGP / totalGames * 4).toFixed(2) + "%)" : (roundAvg * totalTGP / totalGames * 4).toFixed(2) + "%");
	}
	document.getElementById("tgp").style.display = 'none';
	document.getElementById("AvgRounds").innerHTML = roundAvg.toFixed(2);
	document.getElementById("ExtremeRounds").innerHTML = Math.min(...roundResult1) + " / " + Math.max(...roundResult1);
	document.getElementById("ReasonableRounds").innerHTML = roundResult1[pct5] + " / " + roundResult1[pct95];
	document.getElementById("AvgPlayers").innerHTML = endPlayersAvg.toFixed(2);
	document.getElementById("ExtremePlayers").innerHTML = Math.min(...finalEndPlayers1) + " / " + Math.max(...finalEndPlayers1);
	document.getElementById("ReasonablePlayers").innerHTML = finalEndPlayers1[pct5] + " / " + finalEndPlayers1[pct95];

	const distributionKeys = Object.keys(distribution);
	const oldDistributionElements = document.getElementsByClassName("dist-clone");
	while (oldDistributionElements.length > 0) oldDistributionElements[0].remove();

	if (distributionKeys.length > 1) {
		let playersLeftDist = document.getElementById("playersLeftDist");
		playersLeftDist.style.display = 'block';
		let playersLeftDistCols = playersLeftDist.getElementsByTagName("div");
		playersLeftDistCols[0].innerHTML = `Players Left-${distributionKeys[0]}P`;
		playersLeftDistCols[1].innerHTML = (distribution[distributionKeys[0]] / iterations * 100).toFixed(2) + "%";

		let previousDist = playersLeftDist;
		for (let i = 1; i < distributionKeys.length; i++) {
			let currentDist = playersLeftDist.cloneNode(true);
			currentDist.classList.add("dist-clone");
			playersLeftDistCols = currentDist.getElementsByTagName("div");
			playersLeftDistCols[0].innerHTML = `Players Left-${distributionKeys[i]}P`;
			playersLeftDistCols[1].innerHTML = (distribution[distributionKeys[i]] / iterations * 100).toFixed(2) + "%";
			previousDist.insertAdjacentElement("afterend",currentDist);
			previousDist = currentDist;
		}
	} else {
		document.getElementById("playersLeftDist").style.display = 'none';
	}

	if (document.getElementById("finalsQuestion").checked) {
		roundAvg = average(roundResult2);
		endPlayersAvg = average(finalEndPlayers2);
		totalGames = playerGames2[0] + playerGames2[1] + playerGames2[2];
		totalTGP = playerGames2[0] + (1.5 * playerGames2[1]) + (2 * playerGames2[2]);
		let pct5 = parseInt(iterations * 0.05);
		let pct95 = parseInt(iterations * 0.95);
		roundResult2.sort(function(a, b) {
			return a - b;
		});
		finalEndPlayers2.sort(function(a, b) {
			return a - b;
		});

		document.getElementById("2pGames2").innerHTML = (playerGames2[0] / iterations).toFixed(2);
		document.getElementById("3pGames2").innerHTML = (playerGames2[1] / iterations).toFixed(2);
		document.getElementById("4pGames2").innerHTML = (playerGames2[2] / iterations).toFixed(2);
		document.getElementById("TotalGames2").innerHTML = (totalGames / iterations).toFixed(2);
		document.getElementById("MeaningfulGames2").innerHTML = (roundAvg * totalTGP / totalGames).toFixed(2);
		document.getElementById("ApproxTGP2").innerHTML = (roundAvg * totalTGP / totalGames * 4).toFixed(2) + "%";
		let finalTGP = parseFloat(document.getElementById("ApproxTGP").innerHTML) + parseFloat(document.getElementById("ApproxTGP2").innerHTML);
		document.getElementById("TotalTGP2").innerHTML = (finalTGP > 200 ? "200.00% (maxed - " + finalTGP.toFixed(2) + "%)" : (finalTGP.toFixed(2) + "%"));
		document.getElementById("tgp").style.display='block';
		document.getElementById("AvgRounds2").innerHTML = roundAvg.toFixed(2);
		document.getElementById("ExtremeRounds2").innerHTML = Math.min(...roundResult2) + " / " + Math.max(...roundResult2);
		document.getElementById("ReasonableRounds2").innerHTML = roundResult2[pct5] + " / " + roundResult2[pct95];
		document.getElementById("AvgPlayers2").innerHTML = endPlayersAvg.toFixed(2);
		document.getElementById("ExtremePlayers2").innerHTML = Math.min(...finalEndPlayers2) + " / " + Math.max(...finalEndPlayers2);
		document.getElementById("ReasonablePlayers2").innerHTML = finalEndPlayers2[pct5] + " / " + finalEndPlayers2[pct95];
	} else {
		document.getElementById("2pGames2").innerHTML = "&nbsp;";
		document.getElementById("3pGames2").innerHTML = "&nbsp;";
		document.getElementById("4pGames2").innerHTML = "&nbsp;";
		document.getElementById("TotalGames2").innerHTML = "&nbsp;";
		document.getElementById("MeaningfulGames2").innerHTML = "&nbsp;";
		document.getElementById("ApproxTGP2").innerHTML = "&nbsp;";
		document.getElementById("TotalTGP2").innerHTML = "&nbsp;";
		document.getElementById("tgp").style.display = 'none';
		document.getElementById("AvgRounds2").innerHTML = "&nbsp;";
		document.getElementById("ExtremeRounds2").innerHTML = "&nbsp;";
		document.getElementById("ReasonableRounds2").innerHTML = "&nbsp;";
		document.getElementById("AvgPlayers2").innerHTML = "&nbsp;";
		document.getElementById("ExtremePlayers2").innerHTML = "&nbsp;";
		document.getElementById("ReasonablePlayers2").innerHTML = "&nbsp;";
	}

	document.getElementById("copylink").style.display = 'block';
}

function runTournament(players, groupCount, finalStrikes, finalPlayers, playerGames, roundResult, strikeDist, distribution) {
	let topScore = 10000000.0;
	let lowScore = 10000000.0;

	let round = 0;
	let strightGames = 0.0;
	let survivingPlayers = players;

	let playerList = [];

	let byeStrikes = 0;
	let byeStrikes2 = 0;
	let byePlayers = 0;
	let byePlayers2 = 0;
	if (document.getElementById("byeQuestion").checked) {
		byeStrikes2 = parseInt(document.getElementById("byeStrikes3").value);
		byePlayers = parseInt(document.getElementById("byePlayers1").value);
		if (document.getElementById("byeQuestion2").checked) {
			byeStrikes = parseInt(document.getElementById("byeStrikes2").value);
			byePlayers2 = parseInt(document.getElementById("byePlayers2").value) + byePlayers;
		} else {
			byeStrikes = byeStrikes2;
			byePlayers2 = byePlayers;
		}
	}

	for (let i = 0; i < players; i++)
	{
		let playerStrikes = 0;
		if (i >= byePlayers2) {
			playerStrikes = byeStrikes2;
		} else if (i >= byePlayers) {
			playerStrikes = byeStrikes;
		}

		let p = new Player(i, (lowScore + ((topScore - lowScore) * (i / (players - 1)))), playerStrikes); // last variable - number of strikes
		playerList.push(p);
	}

	while (survivingPlayers > finalPlayers)
	{
		let singlePlayerMatches = [ 0, 0, 0 ];

		round++;

		// Clone the playerList array
		allowed = [...playerList];

		while (allowed.length > 1)
		{
			let match = []
			let matchPlayers = 4;
			if ((groupCount === 3 && allowed.length > 2) || (groupCount === 4 && (allowed.length === 9 || allowed.length === 6 || allowed.length === 5 || allowed.length === 3)))
				matchPlayers = 3;
			else if (groupCount === 2 || allowed.length === 2)
				matchPlayers = 2;

			singlePlayerMatches[matchPlayers - 2]++;

			for (let j = 0; j < matchPlayers; j++)
			{
				let chosenPlayer = getRandomInt(allowed.length);
				match.push(allowed[chosenPlayer]);
				match[j].score = getRandomInt(match[j].topScore);
				allowed.splice(chosenPlayer, 1);
			}

			for (let j = 0; j < matchPlayers; j++)
			{
				let rank = 0; // Weird for someone to rank in 0th place, but since arrays are zero-based...
				for (let k = 0; k < matchPlayers; k++)
				{
					if (k == j) continue;
					if (match[j].score < match[k].score) rank++;
				}
				// The old calculator does it this way...
				//rank = (int)((double)match[j].score / match[j].topScore * matchPlayers) + 1;

				// This will carry over to playerList - match[j] is by reference.
				match[j].strikes += strikeDist[matchPlayers - 2][rank];
			}

		}
		for (let j = 0; j < playerList.length; j++) 
		{
			if (playerList[j].strikes >= finalStrikes) 
			{
				playerList.splice(j, 1);
				survivingPlayers--;
				j--;
			}				
		}

		if (survivingPlayers <= finalPlayers && distribution !== undefined)
		{
			if (!distribution[survivingPlayers]) distribution[survivingPlayers] = 1;
			else distribution[survivingPlayers] += 1;
		}
			
		playerGames[0] += singlePlayerMatches[0];
		playerGames[1] += singlePlayerMatches[1];
		playerGames[2] += singlePlayerMatches[2];
		strightGames++;
	}
	roundResult.push(round);
	
	return survivingPlayers;
}

function tgpButton() {
	calcKnockoutTournament(parseInt(document.getElementById("playerCount").value),
		parseInt(document.getElementById("groupCount").value),
		parseInt(document.getElementById("playersLeft").value))	
}

function clipboard() {
	let strikes = "";
	let players = document.getElementById("playerCount").value;
	let playersLeft = document.getElementById("playersLeft").value;
	let groupCount = document.getElementById("groupCount").value;
	let strikesCommon = document.getElementById("commonFormats").value;
	let strikeCount = parseInt(document.getElementById("strikes").value);
	if (strikesCommon == "1") strikes = "F";
	if (strikesCommon == "2") strikes = "P";
	if (strikesCommon == "3") strikes = "1";
	if (strikesCommon == "4") strikes = "L";
	if (strikesCommon == "5") strikes = "S";
	if (strikesCommon == "6") strikes = "O";
	
	let strikeTexts = document.getElementsByName('strikes[]');
	let strikeDist = "";
	for (let i = 0; i < 9; i++) {
		strikeDist = strikeDist + strikeTexts[i].value + (i < 8 ? "," : "");
	}
	
	let tourney1 = strikes + "," + players + "," + playersLeft + "," + groupCount + "," + strikeCount + "," + strikeDist;
	
	let bye1 = "";

	if (document.getElementById("byeQuestion").checked) {
		let byePlayers = parseInt(document.getElementById("byePlayers1").value);
		let byeQuestion2 = (document.getElementById("byeQuestion2").checked ? 't' : 'f');
		let byePlayers2 = parseInt(document.getElementById("byePlayers2").value);
		let byeStrikes = parseInt(document.getElementById("byeStrikes2").value);
		let byeStrikes2 = parseInt(document.getElementById("byeStrikes3").value);

		bye1 = '&bye=' + byePlayers + "," + byeQuestion2 + "," + byePlayers2 + "," + byeStrikes + "," + byeStrikes2;
	}

	let tourney2 = "";
	if (document.getElementById("finalsQuestion").checked) {
		let secondStage = (document.getElementById("exactPlayers").checked ? 't' : 'f');
		groupCount = document.getElementById("groupCount2").value;
		strikesCommon = document.getElementById("commonFormats-f").value;
		strikeCount = parseInt(document.getElementById("strikes2").value);
		if (strikesCommon == "1") strikes = "F";
		if (strikesCommon == "2") strikes = "P";
		if (strikesCommon == "3") strikes = "1";
		if (strikesCommon == "4") strikes = "L";
		if (strikesCommon == "5") strikes = "S";
		if (strikesCommon == "6") strikes = "O";
		
		strikeTexts = document.getElementsByName('strikesF[]');
		strikeDist = "";
		for (let i = 0; i < 9; i++) {
			strikeDist = strikeDist + strikeTexts[i].value + (i < 8 ? "," : "");
		}
		
		tourney2 = '&tourney2=' + secondStage + ',' + strikes + ',' + groupCount + ',' + strikeCount + ',' + strikeDist;
	}

	navigator.clipboard.writeText("https://gameboy9.github.io/strikes.html?tourney1=" + tourney1 + bye1 + tourney2);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function average(numbers) 
{
	let sum = 0;
	for (let i = 0; i < numbers.length; i++) 
	{
		sum += numbers[i];
	}
	return sum / numbers.length;
}
