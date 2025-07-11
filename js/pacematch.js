function fillStrikes() {
	let value = document.getElementById("commonFormats").value;
	if (value === "1") 
	{
		document.getElementById("p21").value = 7;
		document.getElementById("p22").value = 1;
		document.getElementById("p31").value = 7;
		document.getElementById("p32").value = 4;
		document.getElementById("p33").value = 1;
		document.getElementById("p41").value = 7;
		document.getElementById("p42").value = 5;
		document.getElementById("p43").value = 3;
		document.getElementById("p44").value = 1;
	}
	else if (value === "2")
	{
		document.getElementById("p21").value = 5;
		document.getElementById("p22").value = 1;
		document.getElementById("p31").value = 5;
		document.getElementById("p32").value = 3;
		document.getElementById("p33").value = 1;
		document.getElementById("p41").value = 5;
		document.getElementById("p42").value = 3;
		document.getElementById("p43").value = 2;
		document.getElementById("p44").value = 1;
	}
	else if (value === "3")
	{
		document.getElementById("p21").value = 4;
		document.getElementById("p22").value = 0;
		document.getElementById("p31").value = 4;
		document.getElementById("p32").value = 1;
		document.getElementById("p33").value = 0;
		document.getElementById("p41").value = 4;
		document.getElementById("p42").value = 2;
		document.getElementById("p43").value = 1;
		document.getElementById("p44").value = 0;
	}
}

function tgpButton() {
	let paceIncrement = parseInt(document.getElementById("paceIncrement").value);
	let paceMinimum = (parseInt(document.getElementById("p41").value) + parseInt(document.getElementById("p44").value)) / 2 + 1;
	if (paceIncrement < paceMinimum) {
		alert("Invalid increment per round.  Must have a minimum of " + paceMinimum);
		return;
	}
	
	calcKnockoutTournament(
		parseInt(document.getElementById("playerCount").value),
		parseInt(document.getElementById("groupCount").value),
		parseInt(document.getElementById("paceRound").value),
		parseInt(document.getElementById("strikes").value),
		parseInt(document.getElementById("playersLeft").value),
		parseInt(document.getElementById("paceIncrement").value),
		parseInt(document.getElementById("p21").value),
		parseInt(document.getElementById("p22").value),
		parseInt(document.getElementById("p31").value),
		parseInt(document.getElementById("p32").value),
		parseInt(document.getElementById("p33").value),
		parseInt(document.getElementById("p41").value),
		parseInt(document.getElementById("p42").value),
		parseInt(document.getElementById("p43").value),
		parseInt(document.getElementById("p44").value),
		1);
}

function optimalPaceButton() {
	let paceIncrement = parseInt(document.getElementById("paceIncrement").value);
	let paceMinimum = (parseInt(document.getElementById("p41").value) + parseInt(document.getElementById("p44").value)) / 2 + 1;
	if (paceIncrement < paceMinimum) {
		alert("Invalid increment per round.  Must have a minimum of " + paceMinimum);
		return;
	}

	const myWorker = new Worker("js/calcknockout.js");

	myWorker.onmessage = (e) => {
		const messageData = e.data;
		const progress = e.data.progress;
		const playerRangeRecommendations = e.data.playerRangeRecommendations;

		if (progress) {
			const progressPercentage = (progress * 100).toFixed(0) + "%";
			const progressElement = document.getElementById("optimalPaceProgress");
			progressElement.style.width = progressPercentage;
			progressElement.textContent = progressPercentage;
		}

		if (playerRangeRecommendations) {
			// Pivot to player ranges
			// Using forEach to skip undefined indexes of the sparse array
			let recommendationsHtml = "";
			playerRangeRecommendations.forEach((range, strikesValue) => {
				if (range.low === range.high) {
					recommendationsHtml += `${range.low} players: ${strikesValue} points <br>`;
				} else {
					recommendationsHtml += `${range.low} - ${range.high} players: ${strikesValue} points <br>`;
				}
			});
			document.getElementById("OptimalInitialPace").innerHTML = recommendationsHtml;
		}

	};

	console.log("Posting initial message posted to worker");
	myWorker.postMessage([
		parseInt(document.getElementById("playerCountLow").value),
		parseInt(document.getElementById("maxRounds").value),
		parseInt(document.getElementById("playerCount").value),
		parseInt(document.getElementById("groupCount").value),
		parseInt(document.getElementById("paceRound").value),
		parseInt(document.getElementById("strikes").value),
		parseInt(document.getElementById("playersLeft").value),
		parseInt(document.getElementById("paceIncrement").value),
		parseInt(document.getElementById("p21").value),
		parseInt(document.getElementById("p22").value),
		parseInt(document.getElementById("p31").value),
		parseInt(document.getElementById("p32").value),
		parseInt(document.getElementById("p33").value),
		parseInt(document.getElementById("p41").value),
		parseInt(document.getElementById("p42").value),
		parseInt(document.getElementById("p43").value),
		parseInt(document.getElementById("p44").value),
		0]);
}

function showDetailed() {
	for (const element of document.getElementsByClassName("optimized-only")) {
		element.classList.add("w3-hide");
	}
	for (const element of document.getElementsByClassName("detailed-only")) {
		element.classList.remove("w3-hide");
	}
}

function showOptimized() {
	for (const element of document.getElementsByClassName("optimized-only")) {
		element.classList.remove("w3-hide");
	}
	for (const element of document.getElementsByClassName("detailed-only")) {
		element.classList.add("w3-hide");
	}
}

function handleLoad() {
	if (window.Worker) {
		// Web Workers are supported
	} else {
		document.getElementById("optimizedOption").disabled = true;
	}
}