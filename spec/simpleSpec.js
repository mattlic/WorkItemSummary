describe("Simple jasmine spec", function() {
    var adder = require('../lib/simple.js');

    it("can add two numbers", function() {
        expect( adder.add( 2, 2)).toBe( 4);
    });
});

