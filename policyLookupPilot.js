// const util = require('util');
const unirest = require('unirest');
// const fetch = require('node-fetch');

var baseURL = "https://dev.azure.com";
var restApiStr = "_apis/policy";
var restApiAction = "configurations";
var azdoQueryId = '8edae917-512a-491b-89b5-3ba761394e46';
var queryStr = "api-version=5.1";
const organization = "DevDiv";
const project = "DevDiv";
const username = "mattlic@microsoft.com";
const pat = "ny57ltjnw6oku5gwel6g3pnfifcdamwpj5y64npu7fpolis6tnga";

var policies

var useURL = baseURL + "/" + organization + "/" + project + "/" + restApiStr + "/" + restApiAction
// useURL += ("/" + azdoQueryId)
console.log("URL to send: " + useURL + " \n")


unirest
    .get(useURL)
    .query(queryStr)
    .auth({
        user: "",
        pass: pat,
        sendImmediately: true
    }).then((response) => {
        const returnStatus = getReturnCode(response);
        var policySummary = [];
        if (returnStatus == 'Ok') {
            console.log("count is: " + response.body.count);
            var policies = response.body.value;
            var reviewerPolicies = getPoliciesByType("Required reviewers", policies);
            console.log("  Number of Required Reviewer policies: " + Object.keys(reviewerPolicies).length);
            // console.log( reviewerPolicies[1]);
            // for ( var policy in reviewerPolicies) {
            reviewerPolicies.forEach( function (policy) {
                // console.log( policy.settings);
                policySummary.push({
                    'scope': policy.settings.scope, 
                     'reviewerIds': policy.settings.requiredReviewerIds
                });
                // console.log( policy.settings)
            });
            console.log('  reviewer policy [1]: \n' + JSON.stringify(policySummary[1], null, '\t') );
        } else {
            console.log('Did not get an Ok response');
            console.log('  Ruturn status was: ' + returnStatus);
            console.log("  Originalrequest:\n" + JSON.stringify(response.request, null, '\t'));
            throw new Error('did not get an Ok response, Status: ' + returnStatus);
        }
    }).catch((error) => {
        console.warn(error);
    });


const getReturnCode = function (res) {
    var respStatus = "unknown"
    switch (res.statusType) {
        case 1:
            respStatus = "Info"
            break
        case 2:
            respStatus = "Ok"
            break
        case 3:
            respStatus = "Miscellaneous"
            break
        case 4:
            respStatus = "Client Error"
            break
        case 5:
            respStatus = "Server Error"
            break
    }
    return respStatus
}


function getPoliciesByType(type, policies) {
    return policies.filter(
        function (policies) {
            return policies.type.displayName == type
        }
    );
}