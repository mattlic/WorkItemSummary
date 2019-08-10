
const policyPilot = require('../policyLookupPilot');

describe("PolicyLookupPilot", function() {
    var lookupPilot;


    it("should be able to call the policy restAPI", function( done ) {
      var promise = policyPilot.getProcessJson();

      promise.then( function(response) {
        expect( policyPilot.getReturnCode(response) ).toBe( "Ok");
        done()
      });
    });
});

  
  