"use strict";

const unirest = require('unirest');
const organization = "DevDiv";
const project = "DevDiv";
const username = "mattlic@microsoft.com";
const pat = "ny57ltjnw6oku5gwel6g3pnfifcdamwpj5y64npu7fpolis6tnga";

// var policies


getProcessJson().then((response) => {
    const returnStatus = getReturnCode(response);
    if (returnStatus == 'Ok') {
        console.log("count is: " + response.body.count);
        var policies = response.body.value;
        var reviewerPolicies = getPoliciesByType("Required reviewers", policies);
        console.log("  Number of Required Reviewer policies: " + Object.keys(reviewerPolicies).length);
        var policySummaries = getReviewerPolicySummary(reviewerPolicies);
        // console.log('  reviewer policy [1] scope: \n' + JSON.stringify(policySummaries[1].scope[0], null, '\t'));

        /*
        getRepoName(policySummaries[1].scope[0].repositoryId).then((name) => {
            console.log('   the repo is: ' + name);
        });
 
        getReadableScope(policySummaries[1]).then((newScope) => {
            console.log("updated policy object scope: " + JSON.stringify( policySummaries[1].scope[0], null, '\t' ));
        });
      

        updateEachScope(policySummaries[1]).then((policy) => {
            // console.log(' returned policy: ' + policy);
            console.log("updated one policy object scope: " + JSON.stringify(policySummaries[1].scope, null, '\t'));
        });
        */

        processPoliciySummaries(policySummaries).then((updatedPolicies) => {
            console.log('\nAfter processing all policies');
            console.log("updated policy object: " + JSON.stringify(updatedPolicies[1], null, '\t'));
            console.log(updatedPolicies[1]['reviewerIds']);
        });
    } else {
        console.log('Did not get an Ok response');
        console.log('  Ruturn status was: ' + returnStatus);
        console.log("  Originalrequest:\n" + JSON.stringify(response.request, null, '\t'));
        throw new Error('did not get an Ok response, Status: ' + returnStatus);
    }
}).catch((error) => {
    console.warn(error);
});


function getProcessJson() {
    var baseURL = "https://dev.azure.com";
    var restApiStr = "_apis/policy";
    var restApiAction = "configurations";
    var queryStr = "api-version=5.1";

    var useURL = baseURL + "/" + organization + "/" + project + "/" + restApiStr + "/" + restApiAction;
    console.log("URL for 'policies' rest call: " + useURL + " \n")

    return unirest
        .get(useURL)
        .query(queryStr)
        .auth({
            user: "",
            pass: pat,
            sendImmediately: true
        });
}

function getReturnCode(res) {
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

function getReviewerPolicySummary(policies) {
    var policySummary = [];
    policies.forEach(function (policy) {
        // console.log( policy.settings);
        policySummary.push({
            'scope': policy.settings.scope,
            'reviewerIds': policy.settings.requiredReviewerIds
        });
        // console.log( policy.settings)
    });
    return policySummary;
}



function getRepoJson(repoId) {
    var baseURL = "https://dev.azure.com";
    var restApiStr = "_apis/git";
    var restApiAction = "repositories";
    var queryStr = "api-version=5.1";
    var useURL = baseURL + "/" + organization + "/" + project + "/" + restApiStr + "/" + restApiAction + "/" + repoId;

    return unirest
        .get(useURL)
        .query(queryStr)
        .auth({
            user: "",
            pass: pat,
            sendImmediately: true
        });
}

function getRepoName(repoId) {
    return getRepoJson(repoId).then((response) => {
        return response.body.name;
    });
}

function getReadableScope(policy) {
    var repoId = policy.scope[0].repositoryId;
    return getRepoName(repoId).then((repoName) => {
        policy.scope[0]["repositoryName"] = repoName;
        return policy.scope[0];
    });
}

function updateEachScope(policy) {
    var scopesArray = [];
    for (var scopeIndex in policy.scope) {
        var scope = policy.scope[scopeIndex];
        var scopePromise = new Promise(function (resolve, reject) {
            var repoId = scope.repositoryId;
            resolve(
                getRepoName(repoId).then((repoName) => {
                    scope["repositoryName"] = repoName;
                    // console.log("   New scope: " + JSON.stringify(scope, null, '\t'));
                    repoName;
                }));
        });
        scopesArray.push(scopePromise);
    }

    return Promise.all(scopesArray).then((values) => {
        // console.log('Values: ' + values);
        return policy;
    })
    /*
    .then((newPolicy) => {
        // console.log("   New policy: " + JSON.stringify(newPolicy, null, '\t'));
        return new Promise((resolve, reject) => {
            resolve(newPolicy);
        });
    });
    */
}

function processPoliciySummaries(policies) {
    var policiesArray = [];
    for (var policyIndex in policies) {
        // console.log(`policyIndex = ${policyIndex}`);
        var policyPromise = new Promise(function (resolve, reject) {
            resolve(
                updateEachScope(policies[policyIndex]).then((updatedPolicy) => {
                    // console.log('updatedPolicy: '+ JSON.stringify(updatedPolicy, null, '\t'));
                    updatedPolicy;
                }));
        });
        policiesArray.push(policyPromise);
    }
    return Promise.all(policiesArray).then((results) => {
        // console.log( policies[1] );
        return policies;
    });
}


function getUserDescriptor(userID) {
    return getDescriptorJson(userID).then((response) => {
        return response.body.value;
    });
}

function getDescriptorJson(userID) {
    var baseURL = "https://vssps.dev.azure.com"
    var restApiStr = "_apis/graph"
    var restApiAction = "descriptors"
    var queryStr = "api-version=5.1-preview.1"
    var useURL = baseURL + "/" + organization + "/" + restApiStr + "/" + restApiAction + "/" + userID;
    console.log('UserID -> Descriptor URL: ' + useURL);

    return unirest
        .get(useURL)
        .query(queryStr)
        .auth({
            user: "",
            pass: pat,
            sendImmediately: true
        });
}

module.exports.getProcessJson = getProcessJson;
module.exports.getReturnCode = getReturnCode;