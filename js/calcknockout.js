class Player {
	constructor(id, topScore) {
		this.id = id;
		this.topScore = topScore;
		this.strikes = 0;
		this.score = 0;
	}
}

function calcKnockoutTournament(players, groupCount, startRound, finalStrikes, finalPlayers, paceIncrement, p21, p22, p31, p32, p33, p41, p42, p43, p44, type) {	
	let strikeDist = [ 
		[ p21, p22, p22, p22], 
		[ p31, p32, p33, p33], 
		[ p41, p42, p43, p44]
	];

	let topScore = 40000000.0;
	let lowScore = 10000000.0;

	let playerList = [];
	let roundResult = [];
	let finalEndPlayers = [];
	let firstCutPlayers = [];
	let mGamesList = [];
	let playerGames = [ 0, 0, 0 ];
	let firstIteration = "";
	let survivingPlayers = players;
	let iterations = 10000;

	for (let h = 0; h < iterations; h++)
	{
		let round = 0;
		let strightGames = 0.0;
		survivingPlayers = players;
		let finalPaceStrikes = -1;
		let iterationRounds = [ 0, 0, 0 ];

		playerList = [];
		for (let i = 0; i < players; i++)
		{
			let p = new Player(i, (lowScore + ((topScore - lowScore) * (i / (players - 1)))));
			playerList.push(p);
		}
		while (survivingPlayers > finalPlayers)
		{
			let singlePlayerMatches = [ 0, 0, 0 ];

			round++;
			if (round == startRound) {
				finalPaceStrikes = finalStrikes;
			} else if (round >= startRound) {
				finalPaceStrikes += paceIncrement;
			}

			allowed = [...playerList];

			while (allowed.length > 0)
			{
				let match = []
				let matchPlayers = 4;
				if (allowed.length === 9 || allowed.length === 6 || allowed.length === 5 || allowed.length === 3)
					matchPlayers = 3;
				else if (allowed.length ===  2)
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

					// This will carry over to playerList - match[j] is by reference.
					match[j].strikes += strikeDist[matchPlayers - 2][rank];
				}
				
			}
			for (let j = 0; j < playerList.length; j++) 
			{
				if (playerList[j].strikes < finalPaceStrikes)
				{
					playerList.splice(j, 1);
					survivingPlayers--;
					j--;
				}				
			}
			if (h == 0 && type === 1)
				console.log("R" + round + " -  Players:  " + survivingPlayers + " - 4P:  " + singlePlayerMatches[2] + " - 3P:  " + singlePlayerMatches[1] + " - 2P:  " + singlePlayerMatches[0] + " - Pace: " + finalPaceStrikes);

			if (round == startRound)
				firstCutPlayers.push(survivingPlayers);
			
			if (singlePlayerMatches[0] >= singlePlayerMatches[1] && singlePlayerMatches[0] >= singlePlayerMatches[2]) iterationRounds[0]++;
			else if (singlePlayerMatches[1] >= singlePlayerMatches[2]) iterationRounds[1]++;
			else iterationRounds[2]++;
			strightGames++;
		}
		finalEndPlayers.push(survivingPlayers);
		if (h == 0 && type === 1)
			console.log("End players:  " + survivingPlayers);

		roundResult.push(round);
		playerGames[0] += iterationRounds[0];
		playerGames[1] += iterationRounds[1];
		playerGames[2] += iterationRounds[2];
		mGamesList.push(iterationRounds[0] + (1.5 * iterationRounds[1]) + (2 * iterationRounds[2]));
	}

	let roundAvg = average(roundResult);
	let endPlayersAvg =  average(finalEndPlayers);
	let cutPlayersAvg =  average(firstCutPlayers);
	let totalGames = average(mGamesList);
	let totalTGP = average(mGamesList);
	let pct5 = parseInt(iterations * 0.05);
	let pct95 = parseInt(iterations * 0.95);
	roundResult.sort(function(a, b) { return a - b; });
	finalEndPlayers.sort(function(a, b) { return a - b; });
	firstCutPlayers.sort(function(a, b) { return a - b; });

	if (type === 1) {
		document.getElementById("2pGames").innerHTML = (playerGames[0] / iterations).toFixed(2);
		document.getElementById("3pGames").innerHTML = (playerGames[1] / iterations).toFixed(2);
		document.getElementById("4pGames").innerHTML = (playerGames[2] / iterations).toFixed(2);
		document.getElementById("TotalGames").innerHTML = ((playerGames[0] + playerGames[1] + playerGames[2]) / iterations).toFixed(2);
		document.getElementById("MeaningfulGames").innerHTML = totalGames.toFixed(2);
		document.getElementById("ApproxTGP").innerHTML = (totalTGP * 4 > 100 ? "100.00% (maxed - " + (totalTGP * 4).toFixed(2) + "%)" : (totalTGP * 4).toFixed(2) + "%");
		document.getElementById("AvgRounds").innerHTML = roundAvg.toFixed(2);
		document.getElementById("ExtremeRounds").innerHTML = Math.min(...roundResult) + " / " + Math.max(...roundResult);
		document.getElementById("ReasonableRounds").innerHTML = roundResult[pct5] + " / " + roundResult[pct95];
		document.getElementById("AvgPlayers").innerHTML = endPlayersAvg.toFixed(2);
		document.getElementById("ExtremePlayers").innerHTML = Math.min(...finalEndPlayers) + " / " + Math.max(...finalEndPlayers);
		document.getElementById("ReasonablePlayers").innerHTML = finalEndPlayers[pct5] + " / " + finalEndPlayers[pct95];
		document.getElementById("AvgCut").innerHTML = cutPlayersAvg.toFixed(2);
		document.getElementById("ExtremeCut").innerHTML = Math.min(...firstCutPlayers) + " / " + Math.max(...firstCutPlayers);
		document.getElementById("ReasonableCut").innerHTML = firstCutPlayers[pct5] + " / " + firstCutPlayers[pct95];
	}

	return {
		roundResult: roundResult,
		minRounds: Math.min(...roundResult),
		maxRounds: Math.max(...roundResult),
		pct5Rounds: roundResult[pct5],
		pct95Rounds: roundResult[pct95]
	};
}

function calcKnockoutTournamentOptimalPace(minPlayers, maxRoundsLimit, players, groupCount, startRound, finalStrikes, finalPlayers, paceIncrement, p21, p22, p31, p32, p33, p41, p42, p43, p44, type) {

	// Step through the number of players and the number of strikes to find the combination that
	// minimizes the starting pace while keeping the total number of rounds below the max rounds limit

    const stepsToProcess = players - minPlayers + 2; // Plus 1 for pre- and  post-player processing
    const progressPerPlayer = 1 / stepsToProcess;

    if (minPlayers > players) {
        const swap = players;
        players = minPlayers;
        minPlayers = swap;
    }
    
	const strikesRecommendations = [];
    const firstIterationStrikes = startRound * p41 + 1; // just past the maximum possible pace
    const guessFirstIterationStrikes = startRound * average([p41, p42, p43, p44]);
	let prevStrikes = firstIterationStrikes;
	for (let testPlayers = players; testPlayers >= minPlayers; testPlayers--) {
        const playersProcessed = players - testPlayers + 0.5;
        postMessage({ progress: playersProcessed * progressPerPlayer });
		// Starting point has either been constructed to be the minimum possible number of rounds
		// or is from the previous larget player count which suppoted this number of strikes
		strikesRecommendations[testPlayers] = prevStrikes;
		for (let testStrikes = prevStrikes; testStrikes >= 0; testStrikes--) {
			let calcResult = calcKnockoutTournament(testPlayers, groupCount, startRound, testStrikes, finalPlayers, paceIncrement, p21, p22, p31, p32, p33, p41, p42, p43, p44, type);

			if (calcResult.maxRounds > maxRoundsLimit) {
				// Passed the max rounds limit, move on to the next player count
				break;
			} else {
				// Latest best values
				strikesRecommendations[testPlayers] = testStrikes;
				// Next player loop can start here
				prevStrikes = testStrikes;
			}	
		}
	}
    postMessage({progress: (players - minPlayers + 1) * progressPerPlayer});

	// Summarize by strikes
	// Using forEach to skip undefined indexes of the sparse array
	const playerRangeRecommendations = [];
	strikesRecommendations.forEach((strikesValue, playerCount) => {
		const range = playerRangeRecommendations[strikesValue]
		if (range === undefined) {
			playerRangeRecommendations[strikesValue] = { low: playerCount, high: playerCount };
		} else {
			range.high = playerCount;
		}
	});

	console.dir(playerRangeRecommendations);
    return playerRangeRecommendations;
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

onmessage = (e) => {
    console.log("Worker: Initial message received from main script");
    const optimalPaceOutput = calcKnockoutTournamentOptimalPace(...e.data);

    console.log("Worker: Posting final message back to main script");
    postMessage({ 
        progress: 1,
        playerRangeRecommendations: optimalPaceOutput
    });
};