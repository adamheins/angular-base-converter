/*
 * Copyright (c) 2015 Adam Heins
 *
 * This file is part of the Base Converter project, which is distributed under the MIT
 * license. For the full terms, see the included LICENSE file.
 */


// The angular app.
var app = angular.module("base-converter", []);


/**
 * Controller for the app.
 */
app.controller('controller', ['$scope', function($scope) {

    // The first NumberWithBase. This is the number that the user enters.
    $scope.first = new NumberWithBase('', '');

    // The second NumberWithBase. The user enters the base of this number, and the value is the
    // result of the conversion of the first number to this new base.
    $scope.second = new NumberWithBase('', '');

    // Tests for digits too large for their base.
    $scope.incompatible = invalidDigit;
}]);


/**
 * Directive for an input which takes a base, which is a decimal number in [2, 36].
 */
app.directive('input', function() {
    return {
        restrict: 'E',
        require: 'ngModel',
        link: function(scope, element, attr, ngModel) {

            // Must have type='base'.
            if (attr.type !== 'base')
                return;

            // Only numbers from 1 - 36 are allowed to be input.
            element.bind('input', function() {
                var onlyNumbers = this.value.replace(/[^0-9]/g, '');

                if (parseInt(onlyNumbers) > 36)
                    onlyNumbers = '36';
                else if (onlyNumbers == 0)
                    onlyNumbers = '';

                scope.$apply(function() {
                    ngModel.$setViewValue(onlyNumbers);
                    ngModel.$render();
                });
            });

            // The number '1' is allowed to be input, but a single '1' is not a valid base.
            // Therefore, if the number === 1 when the user leaves this input element, it is
            // automatically changed to a 2.
            element.bind('focusout', function () {
                if (parseInt(this.value) === 1) {
                    scope.$apply(function() {
                        ngModel.$setViewValue(2);
                        ngModel.$render();
                    });
                }
            });
        }
    };
});


/**
 * Directive for inputs that take floating point numbers in any base in [2, 36].
 */
app.directive('input', function() {
    return {
        restrict: 'E',
        require: 'ngModel',
        link: function(scope, element, attr, ngModel) {

            if (attr.type !== 'float')
                return;

            // Only allow alpha-numeric input.
            element.bind('input', function () {
                scope.$apply(function() {
                    ngModel.$setViewValue(element.val().replace(/[^.0-9a-z]/gi, ''));
                    ngModel.$render();
                });
            });
        }
    };
});


/**
 * Indicates whether or not one or more of the characters in the number is larger than it's
 * base permits. For example, if the value is "aaa" but the base is 10, the flag is set to true
 * and conversion does not occur.
 *
 * @param {NumberWithBase} numberWithBase The NumberWithBase to check for invalid digits.
 *
 * @return {boolean} True if numberWithBase's number component contains invalid characters,
 *     false otherwise.
 */
function invalidDigit(numberWithBase) {
    if (numberWithBase.base < 2)
        return false;
    for (var i = 0; i < numberWithBase.number.length; i++) {
        if (charToInt(numberWithBase.number.charAt(i)) >= numberWithBase.base)
            return true;
    }
    return false;
}


/**
 * Converts an alphanumeric character to an integer. Digits have the same value as a character.
 * Letters are converted to their index in the alphabet (starting with A = 0) plus 10. So A = 10,
 * B = 11, etc. No distinction is made between upper and lowercase characters.
 *
 * @param {string} ch A string of length 1, containing only the character to be converted.
 *
 * @return {number} The numeric equivalent of the character ch.
 */
function charToInt (ch) {
    if (!isNaN(ch))
        return parseInt(ch);
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(ch.toUpperCase()) + 10;
}


/**
 * Converts an integer in [0, 36] to a character. Number below 10 retain the same value. Numbers
 * above 10 are converted to an appropriate letter, starting with 10 = A, 11 = B, etc.
 *
 * @param {number} i The integer to convert.
 *
 * @return {string} A string with length 1 containing the character representation of i.
 */
function intToChar (i) {
    if (i < 10)
        return i.toString();
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(i - 10);
}


/**
 * A number that is in an arbitrary base.
 *
 * @param {string} number The value of the number.
 * @param {number} base The base of the number.
 */
function NumberWithBase(number, base) {
    this.number = number;
    this.base = base;
}


/**
 * Converts another NumberWithBase to a NumberWithBase having this base.
 *
 * @param {NumberWithBase} other Another NumberWithBase to which we want this NumberWithBase to have
 *     an equivalent value.
 */
NumberWithBase.prototype.convert = function(other) {

    if (this.base < 2 || other.base < 2 || invalidDigit(other) || other.number.length === 0)
        return;

    // Fractional precision is set at 8 places after the radix point. Does not apply to integers.
    var fractionalPrecision = 8;

    // Find the position of the radix point in the number.
    var radixPosition = other.number.indexOf('.');
    if (radixPosition === -1)
        radixPosition = other.number.length;
    radixPosition--;

    var decimalNumber;

    // Convert to decimal number.
    if (other.base == 10) {
        decimalNumber = other.number;
    } else {
        decimalNumber = 0;
        for (var i = 0; i < other.number.length; i++) {
            if (other.number.charAt(i) === '.')
                continue;
            decimalNumber += (charToInt(other.number.charAt(i))
                * Math.pow(other.base, radixPosition));
            radixPosition--;
        }
    }

    // If we are converting to decimal, the process is complete.
    if (this.base == 10) {
        decimalNumber = decimalNumber.toString();
        radixPosition = decimalNumber.indexOf('.')
        if (radixPosition === -1)
            this.number = decimalNumber;
        else
            this.number = decimalNumber.substring(0, radixPosition + fractionalPrecision + 1);
        return;
    }

    var convertedNumber = '';

    // Split number into integer and fractional parts.
    var integerPart = parseInt(decimalNumber);
    var fractionalPart = decimalNumber - integerPart;

    // Convert integer part from decimal to the new base.
    while (integerPart > 0) {
        var rem = intToChar(integerPart % this.base);
        integerPart = parseInt(integerPart / this.base);
        convertedNumber = rem.toString().concat(convertedNumber);
    }

    // If the number was an integer, we're done now.
    if (fractionalPart === 0) {
        this.number = convertedNumber;
        return;
    }

    // Add the radix point.
    convertedNumber = convertedNumber.concat('.');

    // Convert fractional part from decimal to new base.
    while (fractionalPrecision > 0 && fractionalPart !== 0) {
        var result = fractionalPart * this.base;
        var digit = intToChar(parseInt(result));
        fractionalPart = result - parseInt(result);
        convertedNumber = convertedNumber.concat(digit);
        fractionalPrecision--;
    }

    this.number = convertedNumber;
}
