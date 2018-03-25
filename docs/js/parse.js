/* Parse Javascript */

// >>> Guidelines <<<
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

// >>> Structures/Helpers <<<
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

// >>> Parsing <<<
function parseMeta(dataFile) {
    dataFile.lastIndexOf("##");
    lines = rulesResponse.split(/\r?\n/);
    index = 0;
    for (i=0; i<lines.length; i++) {
        index += lines[i].length;
        if (index>)
    }
}