/* Build and Fetch Javascript */



var gameList = {};
var selected = false;

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
    })
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
            // Define some functions only used for rules.txt's.
            function getKeyProperties(keyString) {
                // Split name and value (and trim them). Returns an array, key name[0] and key value[1].
                return keyString.split(/=(.+)/).map(array => array.trim());
            }
            function checkIntegerOrHex(ruleInstruction) {
                if (ruleInstruction === undefined) { // Skip undefined things for rules that e.g. don't have overwriteFormats.
                    return true;
                }
                ruleInstructionSingle = ruleInstruction.split(",")[0]; // Only check the first value. Don't make instructions with mixed static types like e.g. `overwriteFormat = 0x01a,input()` but include them to the instruction.
                if (typeof Number(ruleInstructionSingle) === "number") { // Check if it's only a number or a hex value.
                    if (!(Number.isInteger(Number(ruleInstructionSingle)) !== 0)) {
                        // It's not an integer (or it's a 0 integer, doesn't do anything in rules.txt)
                        console.warn("Texture rule isn't using a valid integer (found: " + ruleInstructionSingle + "), check if a number from `" + treeEntry.path + "` is a float or is 0, which Cemu ignores.");
                    }
                    else {
                        return true; // Integer
                    }
                }
                else {
                    return false; // Instruction
                }
            }
            function storeGameRule(textureRule) {
                // Save instructions to this file's entry in the game folder now that the rule is finished.
                if (!(checkIntegerOrHex(textureRule.overwriteWidth[0]) && checkIntegerOrHex(textureRule.overwriteHeight[0]) && checkIntegerOrHex(textureRule.overwriteFormat[0]))) {
                    // Skip the rules that are entirely static values and don't need processing.
                    // Now 'group' the instructions that belong to the same 'input'.

                    // Now some information over the syntax usage in the graphic packs:
                    // A group can consist of:
                    // * An input bound to it (which can be bound to a group using the define method, see below).
                    //      - Has an instruction. The instruction will run for each 'usage', and can use the attributes.
                    //      - Has the template name for the instruction that will show up in the options panel. (Supported: checkbox, numbers, none).
                    //      - Has the default value (an user should be able to download the packs without having to adjust anything).
                    //      - Has description.
                    //      - Has optional comment (advice, warning).
                    //      - Has optional min-max values.
                    // * Rules (simply use the group's name, e.g. 'auto' or 'gamepad').
                    //      - Add additional attributes, e.g. 'manual(multiplier=3)'. These values can be used by the attribute name (e.g. multiplier) in the input's instruction.
                    //      - Every rule always has it's rule's values as attributes, so there's no need to pass the width, height etc. of the current rule.

                    // There's 3 instruction groups already predefined, auto, gamepad, manual.
                }
            }

            rulesLines = rulesResponse.match(/[^\r\n]+/g);
            currentGame = treeEntry.path.split("/")[0];
            currentRule = new textureRule(undefined);
            gameList[currentGame][treeEntry.path] = [];
            indexLength = 0;

            for (i = 0; i < rulesLines.length; i++) {
                // Keeping comments, but have something to compare with. Also make a variable that holds the current line, as it'll result in overall faster read access.
                currentLine = rulesLines[i].trim();
                parseLine = currentLine.substr(0, -currentLine.indexOf("#") > 0 ? currentLine.length : currentLine.indexOf("#")).trim();

                if (currentLine !== "") {
                    if (parseLine.charAt(0) === '[' && parseLine.slice(-1) === ']') { // New section
                        // First, store the textureRule before creating a new textureRule.
                        if (currentRule.sectionName !== undefined) storeGameRule(currentRule);
                        currentRule = new textureRule(parseLine);
                    }
                    else if (currentRule.sectionName === "[Definition]") {
                        // Generally, we only expect metadata in "[Definition]" section for rules.
                        if (currentLine.charAt(0) === '#' && currentLine.charAt(1) === '#') { // Current line
                            gameList[currentGame][getKeyProperties(currentLine.substr(2))[0]] = JSON.parse(getKeyProperties(currentLine.substr(2))[1]);
                        }
                        // Now only expect either a name or titleId's keys.
                        else if (getKeyProperties(parseLine)[0] === "name") { // Game Title
                            gameList[currentGame].gameTitle = getKeyProperties(parseLine)[1].slice(1, -1); // Removes quotes.
                        }
                        else if (getKeyProperties(parseLine)[0] === "titleIds") { // Game IDs
                            gameList[currentGame].titleIds = getKeyProperties(parseLine)[1];
                        }
                        else {
                            console.warn("Unexpected rules line: `" + parseLine + "` in `" + currentRule.sectionName + "` section from `" + treeEntry.path + "`.");
                        }
                    }
                    else if (currentRule.sectionName === "[Control]") {
                        // Handle VsyncControl
                        if (getKeyProperties(parseLine)[0] === "vsyncFrequency") {
                            currentRule.vsyncFrequency = getKeyProperties(parseLine)[1];
                        }
                    }
                    else if (currentRule.sectionName === "[TextureRedefine]") {
                        // First, read the filters.
                        if (getKeyProperties(parseLine)[0] === "width") {
                            currentRule.width = getKeyProperties(parseLine)[1];
                        }
                        else if (getKeyProperties(parseLine)[0] === "height") {
                            currentRule.height = getKeyProperties(parseLine)[1];
                        }
                        else if (getKeyProperties(parseLine)[0] === "formats") {
                            currentRule.formats = getKeyProperties(parseLine)[1];
                        }
                        else if (getKeyProperties(parseLine)[0] === "formatsExcluded") {
                            currentRule.formatsExcluded = getKeyProperties(parseLine)[1];
                        }
                        else if (getKeyProperties(parseLine)[0] === "tilemodes") {
                            currentRule.tilemodes = getKeyProperties(parseLine)[1];
                        }
                        else if (getKeyProperties(parseLine)[0] === "tilemodesExcluded") {
                            currentRule.tilemodesExcluded = getKeyProperties(parseLine)[1];
                        }
                        // Read overwrites into this format [value, index]
                        else if (getKeyProperties(parseLine)[0] === "overwriteWidth") {
                            currentRule.overwriteWidth = [getKeyProperties(parseLine)[1], indexLength + rulesLines[i].indexOf(getKeyProperties(parseLine)[1]), getKeyProperties(parseLine)[1].length];
                        }
                        else if (getKeyProperties(parseLine)[0] === "overwriteHeight") {
                            currentRule.overwriteHeight = [getKeyProperties(parseLine)[1], indexLength + rulesLines[i].indexOf(getKeyProperties(parseLine)[1]), getKeyProperties(parseLine)[1].length];
                        }
                        else if (getKeyProperties(parseLine)[0] === "overwriteFormat") {
                            currentRule.overwriteFormat = [getKeyProperties(parseLine)[1], indexLength + rulesLines[i].indexOf(getKeyProperties(parseLine)[1]), getKeyProperties(parseLine)[1].length];
                        }
                    }
                }
                indexLength += rulesLines[i].length;
            }
            gameList[currentGame].searchTags.unshift(gameList[currentGame].gameTitle); // Add game title to search tags, easier to pass.

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

// Initiates games fetching
listGames(defaultFetchUrl);