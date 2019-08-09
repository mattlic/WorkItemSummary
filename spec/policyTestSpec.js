describe("PolicyLookupPilot", function() {
    var PolicyLookupPilot = require('../policyLookupPilot');
    var lookupPilot;

  
    beforeEach(function() {
      var lookupPilot = PolicyLookupPilot;
    });
  
    it("should be able to call the policy restAPI", function( done ) {
      var promise = lookupPilot.getProcessJson();

      promise.then( function(response) {
        expect( getReturnCode(response) ).toEqual( "Ok");
      }).always(done);
    });
});

  
  