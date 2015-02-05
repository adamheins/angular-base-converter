/**
 * Base-to-Base Converter script
 * Script to perform number conversions between different bases.
 * Adam Heins
 * 2014-07-05
 */


/**
 * jQuery controlling events.
 */
$(document).ready(function(){
	
    // Close button on error alert is clicked.
    $("#close-button").click(function(){
        $("#input-error").addClass("hidden");
    });
	
    // Convert button is clicked.
    $("#convert").click(function() {

        var error = false;

        // Validate input fields.
        if (!validateConversionValue("#decAcc", 0, 10)) {
            $("#decAcc").addClass("error");
            error = true;
        }
        if (!validateConversionValue("#base1", 1, 36)) {
            $("#base1").addClass("error");
            error = true;
        }
        if (!validateConversionValue("#base2", 1, 36)) {
            $("#base2").addClass("error");
            error = true;
        }		
        if (!validateConversionNumber()) {
            $("#num1").addClass("error");
            error = true;
        }

        // Respond to error.
        if (error)
            $("#input-error").removeClass("hidden");
        else {
            $("#input-error").addClass("hidden");
            $("#num1").removeClass("error");
            $("#decAcc").removeClass("error");
            $("#base1").removeClass("error");
            $("#base2").removeClass("error");
            convert();
        }
    });

    // Validation for key presses in input fields.
    $("#num1").keypress(function(event){
        validateNumberInput(event);
        enter("#num1", event);
    });
	
    $("#base1").keypress(function(event){
        validateNumericKeyInput(event);
        enter("#base1", event);
    });
	
    $("#base2").keypress(function(event){
        validateNumericKeyInput(event);
        enter("#base2", event);
    });
	
    $("#decAcc").keypress(function(event){
        validateNumericKeyInput(event);
        enter("#decAcc", event);
    });
	
    // Validation when value of input fields is changed.
    $("#base1").change(function(){
        validateValue("#base1", 1, 36, 2);
    });
	
    $("#base2").change(function(){
        validateValue("#base2", 1, 36, 2);
    });
	
    $("#decAcc").change(function(){
        validateValue("#decAcc", 0, 10, 3);
    });
});


/**
 * Convert number from first base to the second.
 */
function convert() {
    var base1 = parseInt($("#base1").val());
    var num1 = $("#num1").val();
    var base2 = parseInt($("#base2").val());
    var decAcc = parseInt($("#decAcc").val());

    var num2 = 0;
    var integer = false;

    // Find location of the radix point.
    // If the number is an integer, the location is set to the end of the number.
    var decLoc = num1.indexOf(".");
    if (decLoc === -1) {
        decLoc = num1.length;
        integer = true;
    }
    decLoc--;

    // Convert to decimal.
    for (var i = 0; i < num1.length; i++) {
        if (num1[i] === ".")
            continue;
        num2 += (charToInt(num1[i]) * Math.pow(base1, decLoc));
        decLoc--;
    }

    var newNum = "";

    // Special cases.
    if (base2 === 10) {
	
        // Truncate value to correct accuracy.
        var factor = Math.pow(10, decAcc);
        num2 = parseInt(num2 * factor) / factor;

        $("#num2").val(num2);
        return;
    } else if (base2 === 1) {
        for (var i = 0; i < num2; i++) {
            newNum = newNum.concat("0");
        }
        $("#num2").val(newNum);
        return;
    }

    // Break number into integer and fractional components.
    var intPart = parseInt(num2);
    var fracPart = num2 - intPart;

    if (intPart === 0)
        newNum = "0"; 
		
    var rem;

    // Convert integer part from decimal to the new base.
    while (intPart > 0) {

        // Calculate remainder.
        rem = intToChar(intPart % base2); 
		
        // Calculate remaining integer part.
        intPart = parseInt(intPart / base2);

        // Add the remainder digit to the end of the new number string.	
        newNum = rem.toString().concat(newNum); 
    }

    // If the number to be converted is an integer, then the conversion is complete.
    // If not, continue on to the fractional conversion section.
    if (integer) {
        $("#num2").val(newNum);
        return;
    }

    newNum = newNum.concat(".");

    var result;
    var digit;

    // Convert fractional part from decimal to new base.
    while (decAcc > 0) {
	
        // Calculate fraction multiplied by the base.
        result = fracPart * base2; 
		
        // Get the integer portion of this result.
        digit = intToChar(parseInt(result)); 
		
        // Update the fractional part.
        fracPart = result - parseInt(result); 
		
        // Add the digit to the new number.
        newNum = newNum.concat(digit); 
		
        decAcc--;
    }

    $("#num2").val(newNum);
}


/**
 * Convert a digit character to the decimal number equivalent.
 */
function charToInt (ch) {
    if (!isNaN(ch))
        return parseInt(ch);
    ch = ch.toUpperCase();
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letters.indexOf(ch) + 10;
}


/**
 * Convert an integer to the equivalent digit.
 */
function intToChar (i) {
    if (i < 10)
        return i;
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letters[i - 10];
}


/**
 * Validate that the key input is a numeral.
 */
function validateNumericKeyInput(event) {
    var e = event || window.event; 
    var charCode = e.charCode || e.keyCode; 
    var ch = String.fromCharCode(charCode);

    // Allow backspace, delete, tab, ctrl keys.
    if (event.keyCode === 8 || event.keyCode === 0 || event.keyCode === 127 || event.keyCode === 9 || event.ctrlKey)
        return;

    // Limit to just numeric digits.
    if ("0123456789".indexOf(ch) === -1)
        e.preventDefault(e);
}


/**
 * Validate that the value of the given element is a number and is between the specified upper limit and lower limit.
 * Otherwise, revert it to the specified default value.
 */
function validateValue(id, lowLim, upLim, def) {
    var num = parseFloat($(id).val());
	
    if (!isNaN(num)) {
        if (parseInt(num) != num)
            num = parseInt(num);
        if (num > upLim)
            num = upLim;
        else if (num < lowLim)
            num = lowLim;
        $(id).val(num);
    } else
        $(id).val(def);
}


/**
 * Validate that the key input is an acceptable character given the current base.
 */
function validateNumberInput(event) {
    event = event || window.event; 
    var charCode = event.charCode || event.keyCode;
    var ch = String.fromCharCode(charCode);

    // Allow backspace, delete, tab, ctrl keys.
    if (event.keyCode === 8 || event.keyCode === 0 || event.keyCode === 127 || event.keyCode === 9 || event.ctrlKey)
        return;
	
    // Limit radix points.
    if (ch === ".") {
        if ($("#num1").val().indexOf(".") != -1)
            event.preventDefault(event);
        return;
    }
	
    ch = ch.toUpperCase();
    
    // Check that character is a letter or number, and if its within the correct limit for its current base.
    if("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(ch) === -1 || charToInt(ch) > parseInt($("#base1").val()) - 1)
        event.preventDefault(event);
}


/**
 * Validate the input of the number to be converted.
 * Called by convert() to validate before conversion is attempted.
 */
function validateConversionNumber() {
    var base1 = parseInt($("#base1").val());
    var num1 = $("#num1").val();
    var decimal = false;
    
    // Check if field is empty.
    if (num1 === "")
        return false;
	
    // Check each character to ensure they are in the correct range and that there is only one radix point.
    for (var i = 0; i < num1.length; i++) {
        if (num1[i] === ".") {
            if (decimal)
                return false;
            else
                decimal = true;
        } else if ("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(num1[i].toUpperCase()) === -1 
                || charToInt(num1[i]) > base1 - 1)
            return false;
    }	
    return true;
}


/**
 * Validate that the value of the element with specified id is an integer between the given limits (inclusive).
 * Called by convert() to validate before conversion is attempted.
 */
function validateConversionValue(id, lowLim, upLim) {
    var num = parseFloat($(id).val());
    return (!isNaN(num) && parseInt(num) === num && num <= upLim && num >= lowLim && num != "")
}


/**
 * Enable conversion occurring by pressing enter on input field with specified id.
 */
function enter(id, event) {
    if (event.which === 13) {
        $(id).change();
        $("#convert").click();
    }
}