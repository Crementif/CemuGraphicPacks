/* Parse Javascript */

// >>> Guidelines <<<
// Skip the rules that are entirely static values and don't need processing.
// Now 'group' the instructions that belong to the same 'input'.
// Uses self-developed template/parsing for speed/simplicity

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

// There's 4 instruction groups already predefined: auto, ratio, gamepad, manual.

// >>> Structures/Helpers <<<

function parseValue(input_str, gameReference) {
    if (input_str === undefined) {
        console.debug("Undefined input string, returning empty string...");
        return "";
    }
    else if (input_str.trim() === "") {
        console.debug("Empty input string, returning empty string.");
        return "";
    }
    // Parse the values
    let _input_str = input_str.trim();


    // Check if assignment
    if (_input_str.slice(0, _input_str.indexOf("(")).includes("=")) {
        console.debug("Instruction is an assignment.");
        let assignmentInstruction = _input_str.slice(_input_str.indexOf("=")+1).trim();
        console.groupCollapsed(`Parsing "${assignmentInstruction}" assignment instruction`);
        try {
            let returnedInstruction = parseValue(assignmentInstruction, gameReference);
            console.info("Assignment instruction succesfully parsed", returnedInstruction);
            gameReference.gameVariables[_input_str.slice(0, _input_str.indexOf("=")).trim()] = returnedInstruction;
            console.groupEnd();
            return "";
        }
        catch (assignmentInstructionParseError) {
            console.error("Failed parsing an assignment instruction: "+assignmentInstructionParseError);
            console.groupEnd();
        }
    }

    // Number
    if (Number(_input_str) === NaN) {
        if (Number(_input_str).toString() === _input_str) {
            console.debug("Parsing single number", _input_str);
            return Number(_input_str);
        }
        else {
            console.debug("Parsing number which is used in a calculation...");
        }
    }
    // Strings, javascript objects
    try {
        let JsonObject = JSON.parse(_input_str);
        console.debug("Parsing object", JsonObject);
        return JsonObject;
    }
    catch (jsonParsingError) {}

    // Check if variable
    if (gameReference.gameVariables.hasOwnProperty(_input_str)) {
        return gameReference.gameVariables[_input_str];
    }

    // No parsing could be done
    console.warn("Failed to parse "+_input_str+".");
    return "";
}

function getKeyProperties(keyString) {
    // Check if proper assignment
    if (keyString.indexOf("=") !== keyString.lastIndexOf("=")) console.warn(`Can't use the '=' symbol more then once in ${keyString}.`); // Check if there's multiple assignments
    else if (keyString !== "") console.warn(`Didn't found an assignment. Skipping ${keyString}...`); // Check if non-empty invalid assignment.
    // Split name and value (and trim them). Returns an array, key name[0] and key value[1].
    return keyString.split(/=(.+)/).map(array => JSON.parse(`[${array.trim()}]`)[0]); // Split the array, trim the entries and remove the latest// TODO: Use other method that might be faster.
}

function checkTextureLine(ruleInstruction) {
    if (ruleInstruction === undefined) { // Skip undefined things for rules that e.g. don't have overwriteFormats.
        return true;
    }
    ruleInstructionSingle = ruleInstruction.split(",")[0]; // Only check the first value. Don't make instructions with mixed static types like e.g. `overwriteFormat = 0x01a,exampleInstruction()` but include them to the instruction.
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

// >>> Parsing <<<
function parseMeta(txtFile, gameReference) {
    // Optimize meta parsing
    // - This function will pretty much determine the speed of the site if the website isn't the bottleneck.
    // - Returns an object with the properties.

    let endOfMeta = txtFile.indexOf("\n", txtFile.lastIndexOf("##"));
    let metaLines = txtFile.slice(0, endOfMeta).split(/\r?\n/);

    console.debug(`Optimizing meta parsing, only reading ${endOfMeta} of ${txtFile.length} characters.`);

    // Cycle through each meta line.
    for (i=0; i<metaLines.length; i++) {
        let metaLine = metaLines[i].trim();
        if (metaLine.startsWith("## ")) {
            console.groupCollapsed(`Parsing "${metaLine.slice(3)}" meta instruction...`);
            try {
                instruction = parseValue(metaLine.slice(3), gameReference);
            }
            catch (metaParseError) {
                console.error("Failed parsing a meta instruction: "+metaParseError);
            }
            console.info("Instruction succesfully parsed", instruction);
            console.groupEnd();
        }
        else if (metaLine.startsWith("name =")) {
            gameReference.gameVariables.name = metaLine.slice(4).split('"')[1];
        }
        else if (metaLine.startsWith("titleIds =")) {
            gameReference.gameVariables.titleIds = metaLine.slice(10).trim().split(",");
        }
    }
}