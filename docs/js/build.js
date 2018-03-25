﻿/* Build and Fetch Javascript */



var gameList = {};

function textureRule(sectionName) {
    this.sectionName = sectionName;
    // MISC
    this.vsyncFrequency = undefined;
    // Filters
    this.width = undefined;
    this.height = undefined;
    this.formats = undefined;
    this.formatsExcluded = undefined;
    this.tilemodes = undefined;
    this.tilemodesExcluded = undefined;
    // Overwrites
    // An 'instruction' requires a instructionType, followed by the index and length of the characters from the file.
    this.overwriteWidth = [undefined, 0, 0];
    this.overwriteHeight = [undefined, 0, 0];
    this.overwriteFormat = [undefined, 0, 0];
}

function addGameList(folderName, gameTitle) { // Using templates to add new game entries.
    document.getElementById("gameList").appendChild(document.importNode(document.querySelector('#gameEntryTemplate').content, true));
    currentGameTemplate = document.getElementById("input_folderName").parentElement;
    currentGameTemplate.getElementsByTagName("input")[0].id = "input_" + folderName;
    currentGameTemplate.getElementsByTagName("input")[0].name = folderName;
    currentGameTemplate.getElementsByTagName("label")[0].htmlFor = "input_" + folderName;
    currentGameTemplate.getElementsByTagName("p")[0].id = "label_" + folderName;
    gameList[folderName].displayName = gameTitle[0];
    currentGameTemplate.getElementsByTagName("label")[0].innerText = gameTitle[0]; // The first name tag should always be the game name.
    
    // Try to avoid name overflows by approximately calculating the length and optionally change it's listed title.
    if (document.getElementsByName("selectGames")[0].offsetWidth < currentGameTemplate.getElementsByTagName("label")[0].offsetWidth) {
        if (gameTitle.length > 0) gameList[folderName].displayName = gameTitle[1]; // Use the second name if the first one is too long.
    }
    currentGameTemplate.getElementsByTagName("label")[0].innerText = gameList[folderName].displayName;
    currentGameTemplate.getElementsByTagName("p")[0].innerText = gameList[folderName].displayName;
}

function showLoad() {
    for (var game in gameList) {
        addGameList(game, gameList[game].searchTags);
    }
}

function filterUndefined(array) {
    filteredArray = [];
    for (i = 0; i < array.length; i++) {
        // Remove the undefined arrays, as we can't fetch undefined.
        if (array[i] !== undefined) filteredArray.push(array[i]);
    }
    return filteredArray;
}

function fetchUrl(url, options) {
    return fetch(url, options).then(function (fetchResponse) {
        if (!fetchResponse.ok) {
            throw Error("A wild fetch problem appeared! It's super effective! It's Fetch Status Code™ is " + fetchResponse.statusText);
        }
        return fetchResponse;
    });
}

// Different fetch functions for different files
function fetchGithubJson(jsonUrl) { // Async, returns Promise.
    return fetchUrl(jsonUrl, { cache: "force-cache", headers: { Accept: "application/vnd.github.v3+json" } }).then(jsonResponse => jsonResponse.json());
}

function fetchGeneralJson(jsonUrl, options) { // Async, returns Promise.
    return fetchUrl(jsonUrl, options).then(jsonResponse => jsonResponse.json());
}

function fetchText(textUrl) { // Async, returns Promise.
    return fetchUrl(defaultFileUrl + textUrl, { cache: "force-cache" }).then(textResponse => textResponse.text());
}

// Main Fetch Function
function listResponses(treeEntry) {
    // Process every entry that's passed into the gameList with it's instructions.
    if (treeEntry.path.split("/").length - 1 === 0) { // 
        // Found game folder, add game's array to gameList.
        gameList[treeEntry.path] = {}; // Before storing any attributes to the gameList's file entry, make an empty gameList attributes for this game.
        currentGame = treeEntry.path; // This is just some short some shorthand stuff.
    }
    else if (treeEntry.path === treeEntry.path.split("/")[0] + "/rules.txt") {
        // Found main resolution pack, crawl (meta)data info.
        return fetchText(treeEntry.path).then(rulesResponse => {
            parseMeta(rulesResponse);
            return rulesResponse;
        });
    }
}

function listGames(treeFetchUrl) { // Fetch repository contents
    if (self.fetch) {
        // Fetch is supported by browser.
        fetchGithubJson(treeFetchUrl).then(treeResponse => {
            // Initialize new Promise, made out of every other game file.
            Promise.all(filterUndefined(treeResponse.tree.map(listResponses/*For every entry in the fetched github json*/))).then(dataResponses => {
                // Now that all promises are resolved (and everything is in gameList), wait for user interaction to finish.
                showLoad();
                titleIdString = "";
                for (game in gameList) {
                    titleIdString = titleIdString+(gameList[game].gameId[0]+"|");
                }
                ungroupedCompatRatings = new Object;
                fetchGeneralJson("https://cors-anywhere.herokuapp.com/http://compat.cemu.info/w/api?action=query&titles="+titleIdString.slice(0, -1)+"&redirects&prop=revisions|redirects&rvprop=content&format=json", { cache: "force-cache" }).then(function (compatResponse) {
                    // Load the fetched response to the gameList. The response has all of the titles compatibility info.
                    for (game in compatResponse.query.pages) {
                        if (compatResponse.query.pages[game].redirects!==undefined) ungroupedCompatRatings[compatResponse.query.pages[game].redirects[0].title] = compatResponse.query.pages[game].revisions[0]["*"].match(/(?:version=)[^|]+|(?:OS=)[^|]+|(?:region=)[^|]+|(?:CPU=)[^|]+|(?:GPU=)[^|]+|(?:user=)[^|]+|(?:FPS=)[^|]+|(?:rating=)[^|]+|(?:notes=)[^}}]/gm);
                    }
                });
                console.log("All promises are resolved, succesfully loaded " + dataResponses.length + " responses!");
            });
        });
    }
    else {
        console.warn("Fetch isn't supported (yet) for your browser. If you get this error, your browser isn't yet supported by this website.");
    }
}

// Maybe not really build specific, but has to be loaded before we do any fetching.
// If defined in index.js, it'll be in conflict with the deferred loading behaviour of that.
function loadSettings() {
    settingsFormInputs = document.getElementById("settingsPopupForm").children;
    for (i = 0; i < settingsFormInputs.length; i++) {
        if (settingsFormInputs[i].type === "checkbox") {
            if (localStorage.getItem(settingsFormInputs[i].id) === null) {
                settingsFormInputs[i].checked = settings[settingsFormInputs[i].id]; // Default
            }
            else {
                settings[settingsFormInputs[i].id] = JSON.parse(localStorage.getItem(settingsFormInputs[i].id));
                settingsFormInputs[i].checked = settings[settingsFormInputs[i].id];
            }
        }
        else if (settingsFormInputs[i].type === "text") {
            if (localStorage.getItem(settingsFormInputs[i].id) === null) {
                settingsFormInputs[i].value = settings[settingsFormInputs[i].id]; // Default
            }
            else {
                settings[settingsFormInputs[i].id] = localStorage.getItem(settingsFormInputs[i].id);
                settingsFormInputs[i].value = settings[settingsFormInputs[i].id];
            }
        }
        else if (settingsFormInputs[i].id === "themes") {
            themeLocalstorage = localStorage.getItem(settingsFormInputs[i].id);
            document.body.style = ""; // Reset from custom theme

            if (themeLocalstorage === null) {
                document.body.className = "lightTheme";
            }
            else if (themeLocalstorage === "light" || themeLocalstorage === "dark") {
                document.getElementById(themeLocalstorage + "Theme").checked = true;
                document.body.className = themeLocalstorage + "Theme";
            }
            else if (themeLocalstorage === "custom") {
                customThemeObject = JSON.parse(localStorage.getItem("customTheme"));
                document.body.className = "customTheme";
                document.getElementById("customTheme").checked = true;
                document.body.style.setProperty("--theme-background", customThemeObject.background);
                document.body.style.setProperty("--theme-accentText", customThemeObject.accentText);
                document.body.style.setProperty("--theme-accentColor", customThemeObject.accentColor);
                document.body.style.setProperty("--theme-text", customThemeObject.text);
                document.body.style.setProperty("--theme-button", customThemeObject.button);
                document.body.style.setProperty("--theme-buttonHover", customThemeObject.buttonHover);
                document.body.style.setProperty("--theme-bar", customThemeObject.bar);
                document.body.style.setProperty("--theme-misc", customThemeObject.misc);
                document.getElementById("themeBackground").value = customThemeObject.background.trim();
                document.getElementById("themeAccentText").value = customThemeObject.accentText.trim();
                document.getElementById("themeAccentColor").value = customThemeObject.accentColor.trim();
                document.getElementById("themeText").value = customThemeObject.text.trim();
                document.getElementById("themeButton").value = customThemeObject.button.trim();
                document.getElementById("themeButtonHover").value = customThemeObject.buttonHover.trim();
                document.getElementById("themeBar").value = customThemeObject.bar.trim();
                document.getElementById("themeMisc").value = customThemeObject.misc.trim();
            }
        }

    }
    if (localStorage.getItem("enableLocalstorage") !== null) { // User has made an active decision about localstorage
        document.getElementById("localstorageWarning").style = "display: none;";
    }
}

loadSettings();
repositoryUsername = settings.githubRepositoryUrl.split('/')[3];
repositoryName = settings.githubRepositoryUrl.split('/')[4];
defaultFetchUrl = "https://api.github.com/repos/" + repositoryUsername + "/" + repositoryName + "/git/trees/master:src?recursive=3";
defaultFileUrl = "https://raw.githubusercontent.com/" + repositoryUsername + "/" + repositoryName + "/master/src/";
reportUrl = "https://github.com/" + repositoryUsername + "/" + repositoryName + "/issues/";

// Initiates games fetching
listGames(defaultFetchUrl);