/**
 * ## Testing with canned responses
 * 
 * Run the following commands from the console to caputre responses:
 * 
 * QueuesManager.manager.captureCannedResponses = true;
 * loadQueuesButton();
 * JSON.stringify(QueuesManager.manager.cannedResponses);
 * 
 * Copy the resulting output and save it to a local file.
 * 
 * Later you an use those responses for local testing using these commands:
 * 
 * QueuesManager.manager.useCannedResponses = true;
 * QueuesManager.manager.cannedResponses = JSON.parse(`text copied from captured responses`);
 * loadQueuesButton();
 * 
 */

const nbspEntity = "\u00A0";

class QueuesManager {
	static manager;

	static createOrUpdate(matchPlayApiKey, ...tournamentIdList) {
		if (QueuesManager.manager === undefined) {
			QueuesManager.manager = new QueuesManager(matchPlayApiKey, ...tournamentIdList);
		} else {
			QueuesManager.manager.matchPlayApiKey = matchPlayApiKey;
			QueuesManager.manager.tournamentIdList = tournamentIdList;
		}
	}

	constructor(matchPlayApiKey, ...tournamentIdList) {
		this.matchPlayApiKey = matchPlayApiKey;
		this.tournamentIdList = tournamentIdList;
		this.queues = {};
		this.tournamentInfo = {};
		this.arenaSummary = [];
		this.mergedArenas = new Map();
		this.queueDisplay = undefined;
		this.lastLoadTournamentInfoTimestamp = undefined;
		this.lastLoadTournamentInfoAttemptTimestamp = undefined;
		this.loadTournamentInfoNeeded = true;
		this.usePrefixForSummaryPlayerNames = true;
		this.arenaOrder = "";
		this.cannedResponses = {};
	}

	getQueueName(tournamentId) {
		let name = this.shortNames[tournamentId] || this.tournamentInfo[tournamentId].name;
  		if (name.trim() === "") {
			name = nbspEntity;
  		}
		return name;
	}

	getPlayer(tournamentId, playerId) {
		return this.tournamentInfo[tournamentId].players.find((p) => p.playerId == playerId);
	}

	async getPlayerName(tournamentId, playerId) {
		let player = this.getPlayer(tournamentId, playerId);
		if (player === undefined) {
			this.loadTournamentInfoNeeded = true;
			await this.loadTournamentInfoIfNeededWithDebounce()
			// Try again in case that load worked
			player = this.getPlayer(tournamentId, playerId);
		}
		return player?.name ?? "Name unknown - " + playerId;
	}

	async buildSummaryPlayerName(playerInfo) {
		const playerName = await this.getPlayerName(playerInfo.tournamentId, playerInfo.playerId);

		let prefix = "";
		if (this.usePrefixForSummaryPlayerNames) {
			prefix = this.getQueueName(playerInfo.tournamentId).substring(0, 1);
			if (prefix?.trim() === "") {
				prefix = "";
			} else {
				prefix += " - ";
			}
		}

		return prefix + playerName;
	}

	timeSinceToText(currentTime, pastTime) {
		const lessthan1Minute = "just joined";
		const lessthan2Minutes = "1 minute";
		const morethan2MinutesSuffix = " minutes";
		const morethan999Minutes = "forever";

		const past = Date.parse(pastTime);
		const differenceinMs = currentTime - past;

		const seconds = Math.floor(differenceinMs / 1000);
		const minutes = Math.floor(seconds / 60);

		if (minutes < 1) {
			return lessthan1Minute;
		} else if (minutes < 2) {
			return lessthan2Minutes;
		} else if (minutes > 999) {
			return morethan999Minutes;
		} else {
			return minutes + morethan2MinutesSuffix;
		}
	}

	buildLastUpdatedText(dataLoadTimestamp) {
		const midnightHours = 0;
		const noonHours = 12;

		const hoursInt = dataLoadTimestamp.getHours()
		let timeSuffix;
		let hours;
		if (hoursInt === midnightHours) {
			timeSuffix = "am";
			hours = "12";
		} else if (hoursInt < noonHours) {
			timeSuffix = "am"
			hours = String(hoursInt);
		} else if (hoursInt === noonHours) {
			timeSuffix = "pm"
			hours = "12";
		} else {
			timeSuffix = "pm";
			hours = String(hoursInt - 12);
		}
		// Two-digits for minutes part and seconds part
  		const minutes = String(dataLoadTimestamp.getMinutes()).padStart(2, '0');
  		const seconds = String(dataLoadTimestamp.getSeconds()).padStart(2, '0');
		const lastUpdatedText = `${hours}:${minutes}:${seconds} ${timeSuffix}`;
		return lastUpdatedText;
	}

	async displayQueuesSummary(currentTime) {
		if (this.queueSummaryDisplay !== undefined) {
			// Cleanup old elements
			this.queueSummaryDisplay.remove();
		}

		const queueSummaryTitle = document.getElementById("queueSummaryTitle");
		const queueSummaryHeader = document.getElementById("queueSummaryHeader");

		// Bail early if this content should not be displayed
		if (!this.displaySummary) {
			queueSummaryTitle.classList.add("w3-hide");
			queueSummaryHeader.classList.add("w3-hide");
			return;
		}

		const rowTemplate = document.getElementById("queueSummaryRowTemplate");

		// Hold new elements outside of the DOM until they are ready to display
		this.queueSummaryDisplay = document.createElement("div");

		let rowIndex = 0;
		for (const arenaInfo of this.arenaSummary) {
			const queueItem = this.queues[arenaInfo.arenaId];
			const playerOne = queueItem?.[0];
			const playerTwo = queueItem?.[1];
			const playerThree = queueItem?.[2];
			const queueIsEmpty = (undefined === (playerOne ?? playerTwo ?? playerThree));

			// Skip queues that are inactive unless they still have queued players
			if (arenaInfo.arenaActiveForAll || !queueIsEmpty) {
				const queueSummaryRow = rowTemplate.cloneNode(true);
				queueSummaryRow.id = 'summaryrow-' + arenaInfo.arenaId;
				queueSummaryRow.classList.remove("w3-hide");

				const queueRowCols = queueSummaryRow.getElementsByTagName("div");
				queueRowCols[0].textContent = arenaInfo.name;
				if (queueIsEmpty) {
					let playerOneMessage;
					if (arenaInfo.bestGameBlockedForAny) {
						playerOneMessage = "Blocked for repair";
					} else if (arenaInfo.bestGameQueueClosedForAll) {
						playerOneMessage = "Queue is closed";
					} else {
						playerOneMessage = "Queue is empty";
					}
					queueRowCols[1].textContent = playerOneMessage;	
				} else {
					queueRowCols[1].textContent = await this.buildSummaryPlayerName(playerOne);
				}
				
				if (playerTwo === undefined) {
					queueRowCols[2].textContent = nbspEntity;
				} else {
					queueRowCols[2].textContent = await this.buildSummaryPlayerName(playerTwo);
				}

				if (playerThree === undefined) {
					queueRowCols[3].textContent = nbspEntity;
				} else {
					queueRowCols[3].textContent = await this.buildSummaryPlayerName(playerThree);
				}

				// Row styling
				if (rowIndex > 0) {
					Object.keys(queueRowCols).forEach(k => queueRowCols[k].classList.remove("w3-border-top"));
				}
				if (rowIndex % 2 === 1) {
					Object.keys(queueRowCols).forEach(k => queueRowCols[k].classList.add("w3-pale-green"));
				}
				rowIndex++;

				this.queueSummaryDisplay.appendChild(queueSummaryRow);
			}
		}

		queueSummaryTitle.classList.remove("w3-hide");
		queueSummaryHeader.classList.remove("w3-hide");
		// Add elements into the DOM
		rowTemplate.insertAdjacentElement("afterend", this.queueSummaryDisplay);

	}

	async displayFullQueues(currentTime) {
		if (this.queueDisplay !== undefined) {
			// Cleanup old elements
			this.queueDisplay.remove();
		}

		// Bail early if this content should not be displayed
		if (!this.displayDetails) {
			return;
		}

		const nameTemplate = document.getElementById("queueNameTemplate");
		const headerTemplate = document.getElementById("queueHeaderTemplate");
		const rowTemplate = document.getElementById("queueRowTemplate");

		// Arena arena status message templates
		const blockedQueueRow = {
			rowPrefix: "⚠",
			mainLabel: "Blocked for repair",
			queueName: nbspEntity,
			waitingTime: nbspEntity
		};
		const emptyQueueRow = {
			rowPrefix: nbspEntity,
			mainLabel: "Queue is empty",
			queueName: nbspEntity,
			waitingTime: nbspEntity
		};
		const closedQueueRow = {
			rowPrefix: nbspEntity,
			mainLabel: "Queue is closed",
			queueName: nbspEntity,
			waitingTime: nbspEntity
		};

		// Hold new elements outside of the DOM until they are ready to display
		this.queueDisplay = document.createElement("div");
		this.queueDisplay.classList.add("w3-grid");
		this.queueDisplay.classList.add("queue-list-grid-3");

		for (const arenaKey of Object.keys(this.queues)) {
			const arenaId = parseInt(arenaKey);
			if (!this.arenaSummary.find(arenaInfo => arenaInfo.arenaId === arenaId)) {
				this.loadTournamentInfoNeeded = true;
				await this.loadTournamentInfoIfNeededWithDebounce()
				// Try again in case that load worked
				if (!this.arenaSummary.find(arenaInfo => arenaInfo.arenaId === arenaId)) {
					this.arenaSummary.push({
						arenaId: arenaId,
						name: "Unknown arena - " + arenaId,
						arenaActiveForAll: true,
						bestGameBlockedForAny: false,
						bestGameQueueClosedForAll: false
					});
				}
			}
		}

		for (const arenaInfo of this.arenaSummary) {
			const queueItem = this.queues[arenaInfo.arenaId];
			const queueIsEmpty = queueItem === undefined;

			// Skip queues that are inactive unless they still have queued players
			if (arenaInfo.arenaActiveForAll || !queueIsEmpty) {
				const queueFlexItem = document.createElement("div");
				queueFlexItem.classList.add("rounded-box");
				queueFlexItem.classList.add("w3-border-blue");
				queueFlexItem.classList.add("w3-card");
				this.queueDisplay.appendChild(queueFlexItem);

				const queueName = nameTemplate.cloneNode(true);
				queueName.id = arenaInfo.arenaId + '-name';
				queueName.classList.remove("w3-hide");
				queueName.getElementsByTagName("h4")[0].textContent = arenaInfo.name;
				queueFlexItem.appendChild(queueName);

				const queueHeader = headerTemplate.cloneNode(true);
				queueHeader.id = arenaInfo.arenaId + '-header';
				queueHeader.classList.remove("w3-hide");
				queueFlexItem.appendChild(queueHeader);

				// Augment queued players with arena status messages
				let queueEntries = [];
				if (queueItem === undefined) {
					// Queue is empty
					if (arenaInfo.bestGameBlockedForAny) {
						queueEntries.push(blockedQueueRow);
					} else if (arenaInfo.bestGameQueueClosedForAll) {
						queueEntries.push(closedQueueRow);
					} else {
						queueEntries.push(emptyQueueRow);
					}
				} else {
					if (arenaInfo.bestGameBlockedForAny) {
						queueEntries.push(blockedQueueRow);
					}

					for (const [rowPrefix, queuedPlayer] of Object.entries(queueItem)) {
						const rowNumber = parseInt(rowPrefix) + 1; // Account for 0-based indexing
						const playerName = await this.getPlayerName(queuedPlayer.tournamentId, queuedPlayer.playerId);
						const queueName = this.getQueueName(queuedPlayer.tournamentId);
						const waitingTime = this.timeSinceToText(currentTime, queuedPlayer.createdAt);
						queueEntries.push({
							rowPrefix: rowNumber,
							mainLabel: playerName,
							queueName: queueName,
							waitingTime: waitingTime
						});
					}

					if (arenaInfo.bestGameQueueClosedForAll) {
						queueEntries.push(closedQueueRow);
					}
				}

				let rowIndex = 0;
				for (const queueEntry of queueEntries) {
					const queueRow = rowTemplate.cloneNode(true);
					queueRow.id = arenaInfo.arenaId + "-" + rowIndex;
					queueRow.classList.remove("w3-hide");
					const queueRowCols = queueRow.getElementsByTagName("div");
					queueRowCols[0].textContent = queueEntry.rowPrefix; 
					queueRowCols[1].textContent = queueEntry.mainLabel;
					queueRowCols[2].textContent = queueEntry.queueName;
					queueRowCols[3].textContent = queueEntry.waitingTime;

					// Hide top border after the first row
					if (rowIndex > 0) {
						Object.keys(queueRowCols).forEach(k => queueRowCols[k].classList.remove("w3-border-top"));
					}
					rowIndex++;

					queueFlexItem.appendChild(queueRow);
				}
				
				// Add elements into the DOM
				rowTemplate.insertAdjacentElement("afterend", this.queueDisplay);
			}
		}
	}

	async displayQueues(dataLoadTimestamp) {
		console.log("Queues to display:");
		console.dir(this.queues);

		let displayTimestamp = new Date();
		// When using canned responses, use canned dates too
		if (QueuesManager.manager.useCannedResponses) {
			displayTimestamp = new Date(QueuesManager.manager.cannedResponses.displayTimestamp);
		}
		if (QueuesManager.manager.captureCannedResponses) {
			QueuesManager.manager.cannedResponses.displayTimestamp = displayTimestamp;
		}

		await this.displayQueuesSummary();
		await this.displayFullQueues(displayTimestamp);

		if (dataLoadTimestamp instanceof Date) {
			const lastUpdatedText = this.buildLastUpdatedText(dataLoadTimestamp);
			const lastUpdated = document.getElementById("lastUpdated");
			lastUpdated.classList.remove("w3-hide");
			lastUpdated.textContent = "Last updated " + lastUpdatedText;
		}
	}

	compareByCreatedAt(a, b) {
		if (a.createdAt < b.createdAt) {
			return -1;
		}
		if (a.createdAt > b.createdAt) {
			return 1;
		}
		return 0;
	}

	getTournamentInfoUrl(tournamentId) {
		const url = new URL("https://app.matchplay.events/api/tournaments/" + tournamentId);
		url.searchParams.append("includePlayers", 1);
		url.searchParams.append("includeArenas", 1);
		return url;
	}

	getQueuesUrl(tournamentId) {
		return "https://app.matchplay.events/api/tournaments/" + tournamentId + "/queues";
	}

	makeRequest(url) {
		if (this.useCannedResponses) {
			return new Promise(resolve => resolve(this.cannedResponses[url]));
		}

		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.setRequestHeader("Authorization", "Bearer " + this.matchPlayApiKey);

			xhr.onload = () => {
				if (xhr.status == 200) {
					if (this.captureCannedResponses) {
						this.cannedResponses[url] = xhr.responseText;
					}
					resolve(xhr.responseText);
				} else {
					if (xhr.status == 401 || xhr.status == 403) {
						// Token has been deleted, clear it from local storage and the UI
						// and ask the user to enter a new token
						handleDeletedApiKey();
					} else if (xhr.status == 429) {
						// Request has been rate limited, pause requests for 1 minute
						// alert the user that they should not share tokens across devices
						handleRateLimitedRequest();
					}
					reject(new Error(`Request failed with status ${xhr.status}`));
				}
			};

			xhr.onerror = () => {
				reject(new Error('Network error'));
			};

			xhr.send();
		});
	}

	async loadTournamentInfoIfNeededWithDebounce() {
		const debounceMilliseconds = 1000 * 60; // 60 seconds
		const limitMilliseconds = 1000 * 10; // 10 seconds
		const currentTime = new Date();
		let skipLoad = true;

		if (this.loadTournamentInfoNeeded) {
			if (this.lastLoadTournamentInfoAttemptTimestamp === undefined) {
				skipLoad = false;
			} else {
				const timeSinceLastRefresh = (currentTime - this.lastLoadTournamentInfoTimestamp);
				const timeSinceLastAttempt = (currentTime - this.lastLoadTournamentInfoAttemptTimestamp);
				if (timeSinceLastRefresh < debounceMilliseconds) {
					console.log(`Skipping tournament load request, last refresh was ${timeSinceLastRefresh} ms ago`);
				} else if (timeSinceLastAttempt < limitMilliseconds) {
					console.log(`Skipping tournament load request, last refresh attempt was ${timeSinceLastRefresh} ms ago`);
				} else {
					console.log(`Loading tournament info after debounce of ${timeSinceLastRefresh} ms`);
					skipLoad = false;
				}
			}
		}

		// Force a load of tournament infomation if any of tournament IDs have no tournament info
		if (skipLoad) {
			this.tournamentIdList.forEach(tournamentId => {
				if (tournamentId !== undefined && tournamentId > 0) {
					if (skipLoad && !Object.hasOwn(this.tournamentInfo, tournamentId)) {
						skipLoad = false;
					}
				}
			});
		}

		if (!skipLoad) {
			await this.loadTournamentInfo();
		}
	}

	loadTournamentInfo() {
		const requests = this.tournamentIdList.map(tournamentId => {
			if (tournamentId !== undefined && tournamentId > 0) {
				return this.makeRequest(this.getTournamentInfoUrl(tournamentId));
			} else {
				return new Promise((resolve, reject) => {
					resolve(undefined);
				});
			}
		});

		return Promise.all(requests)
        .then(results => {
            console.log('Load all tournament info requests succeeded:', results);
            // Process the results from all successful requests
			const jsonResults = results.map((r) => r === undefined ? undefined : JSON.parse(r));

			// Clear previous tournament info
			this.tournamentInfo = {};
			this.mergedArenas.clear();

			this.lastLoadTournamentInfoAttemptTimestamp = new Date();
			jsonResults.forEach(response => {
				if (response !== undefined) {
					console.log("Load tournament info response:");
					console.dir(response);

					this.tournamentInfo[response.data.tournamentId] = response.data;

					response.data.arenas.forEach(arena => {
						if (this.mergedArenas.has(arena.arenaId)) {
							this.mergedArenas.get(arena.arenaId).push(arena);
						} else {
							this.mergedArenas.set(arena.arenaId, [arena]);
						}
					});
				}
			});

			// Clear previous tournament rollup
			this.arenaSummary = [];
			for (let [arenaId, mappedArenas] of this.mergedArenas) {
				let name = undefined;
				let arenaActiveForAll = false;
				let bestGameBlockedForAny = false;
				let bestGameQueueClosedForAll = true;

				mappedArenas.forEach(arenaInfo => {
					if (name === undefined) {
						name = arenaInfo.name;
					}
					arenaActiveForAll = arenaActiveForAll || arenaInfo.tournamentArena.status === "active";
					bestGameBlockedForAny = bestGameBlockedForAny || arenaInfo.tournamentArena.bestGameBlocked;
					bestGameQueueClosedForAll = bestGameQueueClosedForAll && arenaInfo.tournamentArena.bestGameQueueClosed;
				});

				this.arenaSummary.push({
					arenaId: arenaId,
					name: name,
					arenaActiveForAll: arenaActiveForAll,
					bestGameBlockedForAny: bestGameBlockedForAny,
					bestGameQueueClosedForAll: bestGameQueueClosedForAll
				});
			}

			// Sort the queues by the provided arena order
			const arenaOrderList = this.arenaOrder.split(",").map(s => s.trim()).filter(s => s !== "");
			if (arenaOrderList.length > 0) {
				this.arenaSummary.sort((a, b) => {
					const sortAFirst = -1;
					const orderUnchanged = 0;
					const sortBFirst = 1;
					const indexOfA = arenaOrderList.findIndex(arenaPrefix => a.name.startsWith(arenaPrefix));
					const indexOfB = arenaOrderList.findIndex(arenaPrefix => b.name.startsWith(arenaPrefix));
					if (indexOfA === -1 && indexOfB === -1) return orderUnchanged; // Neither found
					if (indexOfA === -1) return sortBFirst; // Only B found
					if (indexOfB === -1) return sortAFirst; // Only A found
					if (indexOfA > indexOfB) return sortBFirst; // A came later in the order list
					if (indexOfA < indexOfB) return sortAFirst; // B came later in the order list
					return orderUnchanged; // Matched the same item in the order list
				});
			}

			this.lastLoadTournamentInfoTimestamp = new Date();
			this.loadTournamentInfoNeeded = false;
        })
        .catch(error => {
            console.error('One or more load all queues requests failed:', error);
            // Handle the error from the first rejected request
        });
	}

	loadAllQueues() {
		const requests = this.tournamentIdList.map(tournamentId => {
			if (tournamentId !== undefined && tournamentId > 0) {
				return this.makeRequest(this.getQueuesUrl(tournamentId));
			} else {
				return new Promise((resolve, reject) => {
					resolve(undefined);
				});
			}
		});

		return Promise.all(requests)
        .then(results => {
            console.log('Load all queues requests succeeded:', results);
            // Process the results from all successful requests
			const jsonResults = results.map((r) => r === undefined ? undefined : JSON.parse(r));

			// Clear previous queues
			this.queues = {};

			jsonResults.forEach(response => {
				if (response !== undefined) {
					console.log("Load queue response:");
					console.dir(response);

					Object.keys(response.data).forEach(key => {
						if (this.queues[key] === undefined) {
							this.queues[key] = [];
						}
						this.queues[key].push(...response.data[key]);
					});
				}
			});

			// Sort each queue by time the player joined the queue
			Object.keys(this.queues).forEach(k => {
				this.queues[k].sort(this.compareByCreatedAt);
			});
        })
        .catch(error => {
            console.error('One or more load all queues requests failed:', error);
            // Handle the error from the first rejected request
        });
	}
}

class MergeQueuesSettings {
	static settings;

	static createOrUpdate() {
		if (MergeQueuesSettings.settings === undefined) {
			MergeQueuesSettings.settings = new MergeQueuesSettings();
		}
	}

	static getStorageItemKey = () => "mergequeues";
	static getMatchPlayApiKeyEl = () => document.getElementById("matchPlayApiKey");
	static getTournamentIdAEl = () => document.getElementById("tournamentIdA");
	static getTournamentShortNameAEl = () => document.getElementById("tournamentShortNameA");
	static getTournamentIdBEl = () => document.getElementById("tournamentIdB");
	static getTournamentShortNameBEl = () => document.getElementById("tournamentShortNameB");
	static getArenaOrderEl = () => document.getElementById("arenaOrder");
	static getUsePrefixForSummaryPlayerNamesEl = () => document.getElementById("usePrefixForSummaryPlayerNames");
	static getSectionsToDislayDetailsEl = () => document.getElementById("sectionsToDisplay-details");
	static getSectionsToDislaySummaryEl = () => document.getElementById("sectionsToDisplay-summary");
	static getSectionsToDislayBothEl = () => document.getElementById("sectionsToDisplay-both");

	hasRequiredMatchPlayApiKey() {
		const keyIsBlank = (this.settingsValues.matchPlayApiKey?.trim() ?? "") === "";
		return !keyIsBlank;
	}

	readFromStorage() {
		const itemValue = localStorage.getItem(MergeQueuesSettings.getStorageItemKey());
		this.settingsValues = JSON.parse(itemValue) ?? {};
	}

	writeApiKeyToStorage() {
		const itemValue = localStorage.getItem(MergeQueuesSettings.getStorageItemKey());
		const currentSavedSettingsValues = JSON.parse(itemValue) ?? {};
		currentSavedSettingsValues.matchPlayApiKey = this.settingsValues.matchPlayApiKey;
		localStorage.setItem(MergeQueuesSettings.getStorageItemKey(), JSON.stringify(currentSavedSettingsValues));
	}

	clearSavedApiKeyFromStorage() {
		const itemValue = localStorage.getItem(MergeQueuesSettings.getStorageItemKey());
		const currentSavedSettingsValues = JSON.parse(itemValue) ?? {};
		delete currentSavedSettingsValues.matchPlayApiKey;
		localStorage.setItem(MergeQueuesSettings.getStorageItemKey(), JSON.stringify(currentSavedSettingsValues));
	}

	writeParametersToStorage() {
		const itemValue = localStorage.getItem(MergeQueuesSettings.getStorageItemKey());
		const currentSavedSettingsValues = JSON.parse(itemValue) ?? {};
		currentSavedSettingsValues.tournamentIdA = this.settingsValues.tournamentIdA;
		currentSavedSettingsValues.tournamentShortNameA = this.settingsValues.tournamentShortNameA;
		currentSavedSettingsValues.tournamentIdB = this.settingsValues.tournamentIdB;
		currentSavedSettingsValues.tournamentShortNameB = this.settingsValues.tournamentShortNameB;
		currentSavedSettingsValues.arenaOrder = this.settingsValues.arenaOrder;
		currentSavedSettingsValues.usePrefixForSummaryPlayerNames = this.settingsValues.usePrefixForSummaryPlayerNames;
		currentSavedSettingsValues.displayDetails = this.settingsValues.displayDetails;
		currentSavedSettingsValues.displaySummary = this.settingsValues.displaySummary;
		localStorage.setItem(MergeQueuesSettings.getStorageItemKey(), JSON.stringify(currentSavedSettingsValues));
	}

	clearSavedParametersFromStorage() {
		const itemValue = localStorage.getItem(MergeQueuesSettings.getStorageItemKey());
		const currentSavedSettingsValues = JSON.parse(itemValue) ?? {};
		delete currentSavedSettingsValues.tournamentIdA;
		delete currentSavedSettingsValues.tournamentShortNameA;
		delete currentSavedSettingsValues.tournamentIdB;
		delete currentSavedSettingsValues.tournamentShortNameB;
		delete currentSavedSettingsValues.arenaOrder;
		delete currentSavedSettingsValues.usePrefixForSummaryPlayerNames;
		delete currentSavedSettingsValues.displayDetails;
		delete currentSavedSettingsValues.displaySummary;
		localStorage.setItem(MergeQueuesSettings.getStorageItemKey(), JSON.stringify(currentSavedSettingsValues));
	}

	clearApiKeyFromPage() {
		MergeQueuesSettings.getMatchPlayApiKeyEl().value = "";
	}

	static cleanupApiKeyInput(userInput) {
		const bearerPrefix = "bearer ";
		const bearerPrefixLength = bearerPrefix.length;
		const inputPrefix = userInput.substring(0, bearerPrefixLength);
		if (inputPrefix.toLowerCase() === bearerPrefix) {
			userInput = userInput.substring(bearerPrefixLength);
		}
		return userInput;
	}

	readFromPage() {
		this.settingsValues.matchPlayApiKey = MergeQueuesSettings.cleanupApiKeyInput(MergeQueuesSettings.getMatchPlayApiKeyEl().value);
		this.settingsValues.tournamentIdA = parseInt(MergeQueuesSettings.getTournamentIdAEl().value);
		this.settingsValues.tournamentShortNameA = MergeQueuesSettings.getTournamentShortNameAEl().value;
		this.settingsValues.tournamentIdB = parseInt(MergeQueuesSettings.getTournamentIdBEl().value);
		this.settingsValues.tournamentShortNameB = MergeQueuesSettings.getTournamentShortNameBEl().value;
		this.settingsValues.arenaOrder = MergeQueuesSettings.getArenaOrderEl().value;
		this.settingsValues.usePrefixForSummaryPlayerNames = MergeQueuesSettings.getUsePrefixForSummaryPlayerNamesEl().checked;
		const displayBothChecked = MergeQueuesSettings.getSectionsToDislayBothEl().checked;
		this.settingsValues.displayDetails = displayBothChecked || MergeQueuesSettings.getSectionsToDislayDetailsEl().checked;
		this.settingsValues.displaySummary = displayBothChecked || MergeQueuesSettings.getSectionsToDislaySummaryEl().checked;
	}

	writeToPage() {
		MergeQueuesSettings.getMatchPlayApiKeyEl().value = this.settingsValues.matchPlayApiKey ?? "";
		MergeQueuesSettings.getTournamentIdAEl().value = this.settingsValues.tournamentIdA ?? "";
		MergeQueuesSettings.getTournamentShortNameAEl().value = this.settingsValues.tournamentShortNameA ?? "";
		MergeQueuesSettings.getTournamentIdBEl().value = this.settingsValues.tournamentIdB ?? "";
		MergeQueuesSettings.getTournamentShortNameBEl().value = this.settingsValues.tournamentShortNameB ?? "";
		MergeQueuesSettings.getArenaOrderEl().value = this.settingsValues.arenaOrder ?? "";
		if (this.settingsValues.usePrefixForSummaryPlayerNames !== undefined) {
			MergeQueuesSettings.getUsePrefixForSummaryPlayerNamesEl().checked = this.settingsValues.usePrefixForSummaryPlayerNames;
		}
		if (this.settingsValues.displayDetails && this.settingsValues.displaySummary) {
			MergeQueuesSettings.getSectionsToDislayBothEl().checked = true;
		} else if (this.settingsValues.displayDetails) {
			MergeQueuesSettings.getSectionsToDislayDetailsEl().checked = true;
		} else if (this.settingsValues.displaySummary) {
			MergeQueuesSettings.getSectionsToDislaySummaryEl().checked = true;
		}
	}

	applyToQueuesManager() {
		QueuesManager.createOrUpdate(
			this.settingsValues.matchPlayApiKey,
			this.settingsValues.tournamentIdA,
			this.settingsValues.tournamentIdB);

		QueuesManager.manager.shortNames = {
			[this.settingsValues.tournamentIdA]: this.settingsValues.tournamentShortNameA,
			[this.settingsValues.tournamentIdB]: this.settingsValues.tournamentShortNameB
		};

		QueuesManager.manager.arenaOrder = this.settingsValues.arenaOrder;
		QueuesManager.manager.usePrefixForSummaryPlayerNames = this.settingsValues.usePrefixForSummaryPlayerNames;
		QueuesManager.manager.displayDetails = this.settingsValues.displayDetails;
		QueuesManager.manager.displaySummary = this.settingsValues.displaySummary;
	}

}

function showElement(elementId) {
	document.getElementById(elementId).classList.remove("w3-hide");
}

function hideElement(elementId) {
	document.getElementById(elementId).classList.add("w3-hide");
}

function disableButton(elementId) {
	document.getElementById(elementId).classList.add("w3-disable");
}

function enableButton(elementId) {
	document.getElementById(elementId).classList.remove("w3-disable");
}

function initializeSettings() {
	MergeQueuesSettings.createOrUpdate();
	MergeQueuesSettings.settings.readFromStorage();
	MergeQueuesSettings.settings.applyToQueuesManager();
	MergeQueuesSettings.settings.writeToPage();
}

function handleDeletedApiKey() {
	MergeQueuesSettings.settings.clearApiKeyFromPage();
	clearSavedApiKey();
	showElement("matchPlayKeyInvalidMessage");
	document.getElementById("matchPlayApiKey").addEventListener(
		'input',
		(event) => {
			hideElement("matchPlayKeyInvalidMessage");
		},
		{once: true});
	return false;
}

function handleRateLimitedRequest() {
	const rateLimitTimeoutWaitingPeriod = 1000 * 60; // 1 minute
	stopAutoLoadQueuesButton();
	disableButton("loadQueuesButton");
	disableButton("loadPlayersButton");
	disableButton("startAutoLoadButton");
	showElement("rateLimitedRequestMessage");

	QueuesManager.manager.waitingForRateLimitTimeout = true;
	setTimeout(() => {
		enableButton("loadQueuesButton");
		enableButton("loadPlayersButton");
		enableButton("startAutoLoadButton");
		hideElement("rateLimitedRequestMessage");
		QueuesManager.manager.waitingForRateLimitTimeout = false;
	}, rateLimitTimeoutWaitingPeriod);
}

function validateSettings() {
	if (MergeQueuesSettings.settings.hasRequiredMatchPlayApiKey()) {
		return true;
	} else {
		showElement("matchPlayKeyRequiredMessage");
		document.getElementById("matchPlayApiKey").addEventListener(
			'input',
			(event) => {
				hideElement("matchPlayKeyRequiredMessage");
			},
			{once: true});
		return false;
	}
}

async function loadQueuesButton() {
	let dataLoadTimestamp = new Date();

	// When using canned responses, use canned dates too
	if (QueuesManager.manager.useCannedResponses) {
		dataLoadTimestamp = new Date(QueuesManager.manager.cannedResponses.dataLoadTimestamp);
	}
	if (QueuesManager.manager.captureCannedResponses) {
		QueuesManager.manager.cannedResponses.dataLoadTimestamp = dataLoadTimestamp;
	}

	MergeQueuesSettings.settings.readFromPage();
	MergeQueuesSettings.settings.applyToQueuesManager();
	if (!validateSettings()) return;

	await QueuesManager.manager.loadTournamentInfoIfNeededWithDebounce();
	await QueuesManager.manager.loadAllQueues();
	await QueuesManager.manager.displayQueues(dataLoadTimestamp);
}

async function loadPlayersButton() {
	MergeQueuesSettings.settings.readFromPage();
	MergeQueuesSettings.settings.applyToQueuesManager();
	if (!validateSettings()) return;
	
	await QueuesManager.manager.loadTournamentInfo()
	await QueuesManager.manager.displayQueues();
}

async function autoLoadQueuesAndRepeat() {
	const delayTime = 1000 * 30; // 30 seconds

	if (QueuesManager.manager.autoLoadActive) {
		await loadQueuesButton();
		QueuesManager.manager.pendingAutoLoadTimeoutId = setTimeout(autoLoadQueuesAndRepeat, delayTime);
	}
}

async function startAutoLoadQueuesButton() {
	const maximumAutoLoadTime = 1000 * 60 * 60 * 11; // 11 hours

	MergeQueuesSettings.settings.readFromPage();
	MergeQueuesSettings.settings.applyToQueuesManager();
	if (!validateSettings()) return;

	QueuesManager.manager.autoLoadActive = true;
	autoLoadQueuesAndRepeat();

	QueuesManager.manager.failsafeStopAutoLoadTimeoutId = setTimeout(stopAutoLoadQueuesButton, maximumAutoLoadTime);

	hideElement("startAutoLoadButton");
	showElement("stopAutoLoadButton");
}

function stopAutoLoadQueuesButton() {
	QueuesManager.manager.autoLoadActive = false;
	const activeTimeoutId = QueuesManager.manager.pendingAutoLoadTimeoutId;
	if (activeTimeoutId !== undefined) {
		clearTimeout(activeTimeoutId);
		QueuesManager.manager.pendingAutoLoadTimeoutId = undefined;
	}

	const activeFailesafeTimeoutId = QueuesManager.manager.failsafeStopAutoLoadTimeoutId;
	if (activeFailesafeTimeoutId !== undefined) {
		clearTimeout(activeFailesafeTimeoutId);
		QueuesManager.manager.failsafeStopAutoLoadTimeoutId = undefined;
	}

	showElement("startAutoLoadButton");
	hideElement("stopAutoLoadButton");
}

function flashStatusMessage(el, text) {
	const flashTimeInMilliseconds = 1000 * 3; // 3 sec

	el.textContent = text;
	setTimeout(() => {
		el.textContent = "";
	}, flashTimeInMilliseconds);
}

function saveApiKey() {
	MergeQueuesSettings.settings.readFromPage();
	MergeQueuesSettings.settings.writeApiKeyToStorage();
	flashStatusMessage(document.getElementById("saveKeyStatus"), "Saved!");
}

function clearSavedApiKey() {
	MergeQueuesSettings.settings.clearSavedApiKeyFromStorage();
	flashStatusMessage(document.getElementById("saveKeyStatus"), "Cleared!");
}

function saveParameters() {
	MergeQueuesSettings.settings.readFromPage();
	MergeQueuesSettings.settings.writeParametersToStorage();
	flashStatusMessage(document.getElementById("saveParametersStatus"), "Saved!");
}

function clearSavedParameters() {
	MergeQueuesSettings.settings.clearSavedParametersFromStorage();
	flashStatusMessage(document.getElementById("saveParametersStatus"), "Cleared!");
}

function showParameters() {
	showElement("parametersSection");
	hideElement("showParametersButton");
	showElement("hideParametersButton");
	const controlLabels = document.getElementsByClassName("control-labels");
	[...controlLabels].forEach(el => el.classList.remove("w3-hide"));
}

function hideParameters() {
	hideElement("parametersSection");
	showElement("showParametersButton");
	hideElement("hideParametersButton");
	const controlLabels = document.getElementsByClassName("control-labels");
	[...controlLabels].forEach(el => el.classList.add("w3-hide"));
}
