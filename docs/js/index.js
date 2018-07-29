/* Page specific functions */

function generateReportIssueUrl(title, body) {
    return reportUrl + "new?title=" + title + "&body=" + body;
}

function showPreview(elementClicked) {
    // Now process the request to the new element.
    if (elementClicked.classList.contains("clickLabel")) {
        currentFolderName = elementClicked.id.substr(6);
    }
    else if (elementClicked.id === "nextButton") {
        currentFolderName = document.getElementById("gameList").querySelector(".checkbox:checked~.clickLabel:not(.custom)").id.substr(6);
    }
    // Change the preview.
    document.getElementById("settingsSection").className = "maximized";
    document.getElementById("gameTitle").innerText = gameList[currentFolderName].gameVariables.name;
    document.getElementById("nextButton").title=gameList[currentFolderName];
}

function filterGameList(searchString) {
    searchResults = 0;
    if (searchString.value.toLowerCase().indexOf("mario od") > -1) document.getElementById("logo").innerText = "SwEmu Graphic Packs"; // 'ha funny'
    for (var game in gameList) {
        for (i = 0; i < gameList[game].gameVariables.searchTags.length; i++) {
            // Now compare it with the search string.
            if (gameList[game].gameVariables.searchTags[i].toLowerCase().indexOf(searchString.value.toLowerCase()) > -1) {
                document.getElementsByName(game)[0].parentElement.style = "";
                searchResults += 1;
                break; // Found 1 tag that matched. Quit looping this game entry.
            }
            else {
                document.getElementsByName(game)[0].parentElement.style = "display: none;";
            }
        }
    }
    if (searchResults === 0) {
        // Show no search results message.
        document.getElementById("noSearchResults").style = "";
        document.getElementById("searchIssueUrl").href = generateReportIssueUrl("[Missing] " + searchString.value + " graphic pack", "The website couldn't resolve or find a graphic packs if I searched for '" + searchString.value + "'. This shouldn't be the case as it runs on Cemu [include an optional screenshot by drag and dropping an image]. Maybe it just needs to be added as a search tag and could be found with some other tags. Thanks for checking!");
    }
    else {
        document.getElementById("noSearchResults").style = "display: none;";
    }
}

function togglePopup(event) {
    if (event.target.tagName === "BUTTON"/*Button*/ || event.target.parentElement.tagName === "BUTTON"/*Strong tags within button*/ || event.target.id === "settingsPopup"/*Background*/) {
        document.getElementById("settingsPopup").classList.toggle("hiddenPopup");
    }
    else if (event.target.id === "settingsClose") {
        document.getElementById("settingsPopup").classList.add("hiddenPopup");
    }
}

function showGame(currentPopup) {
    console.log(currentPopup);
}

function continueToSettings() {
    document.getElementById("continueButton").value = "Go back";
    document.getElementById("actionTitle").innerText = "Select a game to view it's options.";
    // Go to the next stage
    document.getElementsByTagName("main")[0].classList.add("selectOptions"); // The stage switching is purely cosmetic
    // Make a new array with all of the selected packs.
    document.querySelectorAll(".checkbox:checked ~ .clickLabel").forEach(selectedGame => {
        processingList.
    });
}

function checkSelectionHover() {
    for (var i = 0; i < document.getElementsByName("selectGames")[0].getElementsByClassName("checkbox").length; i++) {
        if (document.getElementsByName("selectGames")[0].getElementsByClassName("checkbox")[i].checked) {
            document.getElementById("continueButton").disabled = false;
            return;
        }
    }
    document.getElementById("continueButton").disabled = true;
}

function changePreviewSize() {
    if (document.getElementById("options").scrollTop > 10) {
        document.getElementById("settingsSection").className = "minimized";
    }
    else {
        document.getElementById("settingsSection").className = "maximized";
    }
}

function downloadBuild() {
}

function storeSettings(element) {
    if (element.type === "checkbox") localStorage.setItem(element.id, element.checked);
    if (element.type === "text") localStorage.setItem(element.id, element.value);
    if (element.id === "themes") {
        if (document.getElementById("lightTheme").checked) localStorage.setItem(element.id, "light");
        if (document.getElementById("darkTheme").checked) localStorage.setItem(element.id, "dark");
        if (document.getElementById("customTheme").checked) {
            localStorage.setItem(element.id, "custom");
            if (localStorage.getItem("customTheme") === null) { // When there's no custom theme stored, get the current values and use those.
                computedStyle = window.getComputedStyle(document.body);
                themePickerObject = {
                    background: computedStyle.getPropertyValue("--theme-background"),
                    accentText: computedStyle.getPropertyValue("--theme-accentText"),
                    accentColor: computedStyle.getPropertyValue("--theme-accentColor"),
                    text: computedStyle.getPropertyValue("--theme-text"),
                    button: computedStyle.getPropertyValue("--theme-button"),
                    buttonHover: computedStyle.getPropertyValue("--theme-buttonHover"),
                    bar: computedStyle.getPropertyValue("--theme-bar"),
                    misc: computedStyle.getPropertyValue("--theme-misc")
                };
            }
            else {
                themePickerObject = {
                    background: document.getElementById("themeBackground").value,
                    accentText: document.getElementById("themeAccentText").value,
                    accentColor: document.getElementById("themeAccentColor").value,
                    text: document.getElementById("themeText").value,
                    button: document.getElementById("themeButton").value,
                    buttonHover: document.getElementById("themeButtonHover").value,
                    bar: document.getElementById("themeBar").value,
                    misc: document.getElementById("themeMisc").value
                };
            }
            localStorage.setItem("customTheme", JSON.stringify(themePickerObject));
        }
        loadSettings(); // Reload theme
    }
}