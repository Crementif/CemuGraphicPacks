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
    document.getElementById("gameTitle").innerText = gameList[currentFolderName].displayName;
    // Check if it's the last option, change the next button.
}

function filterGameList(searchString) {
    searchResults = 0;
    if (searchString.value.toLowerCase().indexOf("mario od") > -1) document.getElementById("logo").innerText = "SwEmu Graphic Packs"; // 'ha funny'
    for (var game in gameList) {
        for (i = 0; i < gameList[game].searchTags.length; i++) {
            // Now compare it with the search string.
            if (gameList[game].searchTags[i].toLowerCase().indexOf(searchString.value.toLowerCase()) > -1) {
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

function continueToSettings() {
    if (selected) {
        document.getElementById("continueButton").value = "Go back";
        document.getElementById("actionTitle").innerText = "Select a game to view it's options.";
        // Go to the next stage
        document.getElementsByTagName("main")[0].classList.add("selectOptions"); // The stage switching is purely cosmetic
    }
    else {
        document.getElementById("noSelectionText").className = "noSelectionText";
        document.getElementById("gameList").className += "noSelectionCheckbox";
    }
}

function hoverAction(hovering) {
    if (hovering) {
        for (var i = 0; i < document.getElementsByClassName("checkbox").length; i++) {
            if (document.getElementsByClassName("checkbox")[i].checked) {
                document.getElementById("continueButton").style = "background-color: var(--theme-buttonHover);";
                selected = true;
                return;
            }
        }
        // Reset noSelection transition (TODO: Poor design)
        document.getElementById("noSelectionText").className = "";
        document.getElementById("gameList").className = "";
    }
    selected = false;
    document.getElementById("continueButton").style = "background-color: var(--theme-button);";
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
    if (element.name === "theme") {
        localStorage.setItem("darkTheme", document.getElementById("darkTheme").checked);
        loadSettings();
    }
}