// Test decimal to binary with integers.
(function() {
    var test = new NumberWithBase(null, 2);
    test.convert(new NumberWithBase('999', 10));
    assertEquals('1111100111', test.number);
})();


// Test decimal to binary with floats.
(function() {
    var test = new NumberWithBase(null, 2);
    test.convert(new NumberWithBase('123.45', 10));
    assertEquals('1111011.01110011', test.number);
})();


// Test binary to decimal with integers.
(function() {
    var test = new NumberWithBase(null, 10);
    test.convert(new NumberWithBase('1111100111', 2));
    assertEquals('999', test.number);
})();


// Test binary to decimal with floats.
(function() {
    var test = new NumberWithBase(null, 10);
    test.convert(new NumberWithBase('1111.111', 2));
    assertEquals('15.875', test.number);
})();


// Test no conversion.
(function() {
    var test = new NumberWithBase(null, 10);
    test.convert(new NumberWithBase('987.654', 10));
    assertEquals('987.654', test.number);
})();


// Test decimal to base 36 with integers.
(function() {
    var test = new NumberWithBase(null, 36);
    test.convert(new NumberWithBase('555', 10));
    assertEquals('FF', test.number);
})();


// Test decimal to base 36 with floats.
(function() {
    var test = new NumberWithBase(null, 36);
    test.convert(new NumberWithBase('123.45', 10));
    assertEquals('3F.G7777777', test.number);
})();


// Test base 36 to decimal with integers.
(function() {
    var test = new NumberWithBase(null, 10);
    test.convert(new NumberWithBase('ff', 36));
    assertEquals('555', test.number);
})();


// Test base 36 to decimal with floats.
(function() {
    var test = new NumberWithBase(null, 10);
    test.convert(new NumberWithBase('adam.heins', 36));
    assertEquals('483790.48342465', test.number);
})();


// Test with two non-decimal bases.
(function() {
    var test = new NumberWithBase(null, 30);
    test.convert(new NumberWithBase('a123', 11));
    assertEquals('ESG', test.number);
})();


// Test conversion to and from same base.
(function() {
    var test = new NumberWithBase(null, 16);
    test.convert(new NumberWithBase('ABC.DEF', 16));
    assertEquals('ABC.DEF', test.number);
})();


console.log('Testing complete.');


/**
 * Asserts that two objects are equal.
 *
 * @param {object} expected The expected value of the object.
 * @param {object} actual The actual value of the object.
 * @param {string} message Optional. A message to display if expected and actual are not equal.
 */
function assertEquals(expected, actual, message) {
    if (message === undefined)
        message = 'Expected <' + expected + '> (' + typeof(expected) + '), but instead received <'
            + actual + '> (' + typeof(actual) + ').';

    // Any other combination of objects.
    if (expected !== actual)
        throw message;
}
