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

        /*
        // console.log('  reviewer policy [1] scope: \n' + JSON.stringify(policySummaries[1].scope[0], null, '\t'));
        getRepoName(policySummaries[1].scope[0].repositoryId).then((name) => {
            console.log('   the repo is: ' + name);
        });
        getReadableScope(policySummaries[1]).then((newScope) => {
            console.log("updated policy object scope: " + JSON.stringify( policySummaries[1], null, '\t' ));
        });
        updateEachScope(policySummaries[1]).then((policy) => {
            // console.log(' returned policy: ' + policy);
            console.log("updated one policy object scope: " + JSON.stringify(policySummaries[10], null, '\t'));
        });
        processPoliciySummaries1(policySummaries).then((updatedPolicies) => {
            console.log('\nAfter processing all repos');
            console.log("updated policy object: " + JSON.stringify(updatedPolicies[10], null, '\t'));
            getUserDescriptor(updatedPolicies[10]['reviewerIds']).then((reviewerDiscriptor) => {
                console.log('Descriptor: ' + reviewerDiscriptor);
                return reviewerDiscriptor;
            }).then((reviewerDiscriptor) => {
                getUserName(reviewerDiscriptor).then((userName) => {
                    console.log('Reviewer name: ' + userName);
                });
            })
        });

        processPoliciySummaries3(policySummaries).then((updatedPolicies) => {
            // console.log(updatedPolicies);
            // Promise.all(updatedPolicies).then((results) => {
            console.log('\nAfter processing all repos');
            // console.log(updatedPolicies);
            console.log("updated policy object: " + JSON.stringify(policySummaries[0], null, '\t'));
            console.log("updated policy object: " + JSON.stringify(policySummaries[1], null, '\t'));
            console.log("updated policy object: " + JSON.stringify(policySummaries[10], null, '\t'));
            console.log("updated policy object: " + JSON.stringify(policySummaries[20], null, '\t'));
            console.log("updated policy object: " + JSON.stringify(policySummaries[80], null, '\t'));
            // });
        });        
        */




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



function updatePolicy(policy) {
    var policyPromise = new Promise((resolve, reject) => {
        var policyUpdate1 = updateEachScope(policy);
        var policyUpdate2 = updateEachReviewer(policy);

        **
        **
        * // TODO: add the sync of updates and return a promice with the policy

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
}


function updateEachReviewer(policy) {
    var reviewersArray = [];
    policy['reviewerNames'] = [];
    for (var reviewerIndex in policy.reviewerIds) {
        var policyReviewers = policy['reviewerNames'];
        var reviewerID = policy.reviewerIds[reviewerIndex];
        var reviewerPromise = new Promise(function (resolve, reject) {
            resolve(
                getUserDescriptor(reviewerID).then((reviewerDiscriptor) => {
                    return reviewerDiscriptor;
                }).then((reviewerDiscriptor) => {
                    if (reviewerDiscriptor) {
                        getUserName(reviewerDiscriptor).then((userName) => {
                            // console.log('Reviewer name: ' + userName);
                            if (!userName) userName = 'Not found';
                            policyReviewers.push(userName);
                            // console.log("   internal policy: " + JSON.stringify(policy, null, '\t'));
                            return userName;
                        }).then((userName) => {
                            // console.log( policy.reviewerNames[ policy.reviewerNames.length - 1 ]); 
                            resolve(policy.reviewerNames[policy.reviewerNames.length - 1]);
                        });
                    } else {
                        var userName = 'Not found';
                        reviewerNames.push(userName);
                        return userName;
                    }
                }));
        });
        reviewersArray.push(reviewerPromise);
    }
    return Promise.all(reviewersArray).then((result) => {
        return policy;

        /*
        return new Promise((resolve, reject) => {
            // onsole.log( result );
            resolve( policy );
        });s
        */
    });


    /*
    function updateEachReviewer(policy) {
        var reviewersArray = [];
        policy['reviewerNames'] = [];
        for (var reviewerIndex in policy.reviewerIds) {
            var policyReviewers = policy['reviewerNames'];
            var reviewerID = policy.reviewerIds[reviewerIndex];
            var reviewerPromise = new Promise(function (resolve, reject) {
                resolve(
                    getUserDescriptor(reviewerID).then((reviewerDiscriptor) => {
                        return reviewerDiscriptor;
                    }).then((reviewerDiscriptor) => {
                        if (reviewerDiscriptor) {
                            getUserName(reviewerDiscriptor).then((userName) => {
                                // console.log('Reviewer name: ' + userName);
                                if (!userName) userName = 'Not found';
                                policyReviewers.push(userName);
                                // console.log("   internal policy: " + JSON.stringify(policy, null, '\t'));
                                return userName;
                            }).then( (userName) => {
                                // console.log( policy.reviewerNames[ policy.reviewerNames.length - 1 ]); 
                                resolve( policy.reviewerNames[ policy.reviewerNames.length - 1 ] );
                            });
                        } else {
                            var userName = 'Not found';
                            reviewerNames.push(userName);
                            return userName;
                        }
                    }).catch((err) => {
                        console.log('  error: ' + err);
                        var userName = 'Not found';
                        console.log('Added default reviewer name: ' + userName);
                        reviewerNames.push(userName);
                        userName;
                        // userName;
                    })
                )
            });
            reviewersArray.push(reviewerPromise);
        }
        // console.log( reviewersArray);
        return Promise.all(reviewersArray).then((result) => {
            // console.log( result );
            return new Promise((resolve, reject) => {
                // onsole.log( result );
                resolve( policy );
            });s
        });

        .then((values) => {
            // console.log('Values: ' + values);
            return policy;
        })
      
    }
      */

    function processPoliciySummaries1(policies) {
        var policiesArray1 = [];
        for (var policyIndex in policies) {
            // console.log(`policyIndex = ${policyIndex}`);
            var policyPromise = new Promise(function (resolve, reject) {
                resolve(
                    updateEachScope(policies[policyIndex]).then((updatedPolicy) => {
                        // console.log('updatedPolicy: '+ JSON.stringify(updatedPolicy, null, '\t'));
                        updatedPolicy;
                    }));
            });
            policiesArray1.push(policyPromise);
        }
        return Promise.all(policiesArray1).then((results) => {
            // console.log( results );
            return policies;
        });

    }


    function processPoliciySummaries2(policies) {
        var allPoliciesArray = [];
        for (var policyIndex in policies) {
            var policiesArray = [];
            // console.log(`policyIndex = ${policyIndex}`);
            var policyPromise1 = new Promise(function (resolve, reject) {
                resolve(
                    updateEachScope(policies[policyIndex]).then((updatedPolicy) => {
                        // console.log('updatedPolicy: '+ JSON.stringify(updatedPolicy, null, '\t'));
                        updatedPolicy;
                    }));
            });
            policiesArray.push(policyPromise1);

            var policyPromise2 = new Promise(function (resolve, reject) {
                resolve(
                    updateEachReviewer(policies[policyIndex]).then((updatedPolicy) => {
                        // console.log('updatedPolicy: ' + JSON.stringify(updatedPolicy, null, '\t'));
                        updatedPolicy;
                    }).catch((err) => {
                        console.log('  error: ' + err);
                    }));
            });
            policiesArray.push(policyPromise2);

            allPoliciesArray.push(Promise.all(policiesArray));
        }

        /*
        for (var policyIndex in policies) {
            // console.log(`policyIndex = ${policyIndex}`);
            var policyPromise = new Promise(function (resolve, reject) {
                resolve(
                    updateEachReviewer(policies[policyIndex]).then((updatedPolicy) => {
                        // console.log('updatedPolicy: ' + JSON.stringify(updatedPolicy, null, '\t'));
                        return updatedPolicy;
                    }).catch((err) => {
                        console.log('  error: ' + err);
                    }));
            });
            policiesArray.push(policyPromise);
        }
        */

        return Promise.all(allPoliciesArray);
        /*
        .then((results) => {
                // console.log( policies );
                // console.log( results[0] );
                // return policies;
                // return results;
                resolve(policies);
            });
            */
    }


    function processPoliciySummaries3(policies) {
        var allPoliciesArray = [];
        for (var policyIndex in policies) {
            var policy = policies[policyIndex];
            var policyPromise = new Promise((resolve, reject) => {
                resolve(
                    Promise.all([updateEachScope(policy), updateEachReviewer(policy)]).then((result) => {
                        // console.log(result);
                        // result;
                        policy;
                    }))
            });
            allPoliciesArray.push(policyPromise);
        }
        // console.log(allPoliciesArray);
        return Promise.all(allPoliciesArray).then((result) => {
            // console.log(policies);
            return policies;
        });
    }



    function getDescriptorJson(userID) {
        var baseURL = "https://vssps.dev.azure.com";
        var restApiStr = "_apis/graph";
        var restApiAction = "descriptors";
        var queryStr = "api-version=5.1-preview.1";
        var useURL = baseURL + "/" + organization + "/" + restApiStr + "/" + restApiAction + "/" + userID;
        // console.log('UserID -> Descriptor URL: ' + useURL + '?' + queryStr);

        return unirest
            .get(useURL)
            .query(queryStr)
            .auth({
                user: "",
                pass: pat,
                sendImmediately: true
            });
    }


    function getUserDescriptor(reviewerID) {
        return getDescriptorJson(reviewerID).then((response) => {
            return response.body.value;
        });
    }

    function getUserName(descriptorID) {
        return getNameJson(descriptorID).then((response) => {
            return response.body.displayName;
        });
    }

    function getNameJson(descriptorID) {
        var baseURL = "https://vssps.dev.azure.com";
        var restApiStr = "_apis/graph";
        var restApiAction;
        var queryStr = "api-version=5.1-preview.1";

        var descriptorPrefix = (descriptorID.split('.'))[0];
        // console.log('descriptorPrefix = ' + descriptorPrefix);
        switch (descriptorPrefix) {
            case 'vssgp':
                restApiAction = "groups";
                break;
            case 'aad':
            default:
                restApiAction = "users";
                break;
        }

        var useURL = baseURL + "/" + organization + "/" + restApiStr + "/" + restApiAction + "/" + descriptorID;
        // console.log('DescriptorID -> Name URL: ' + useURL + '?' + queryStr);

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