var unirest = require("unirest");

var baseURL = "https://dev.azure.com"
var restApiStr = "_apis/policy"
var restApiAction = "configurations"
var azdoQueryId = '8edae917-512a-491b-89b5-3ba761394e46'
var queryStr = "api-version=5.1"
var queryStr2 = "$depth=1"
const organization = "DevDiv";
const project = "DevDiv";
const username = "mattlic@microsoft.com";
const pat = "ny57ltjnw6oku5gwel6g3pnfifcdamwpj5y64npu7fpolis6tnga";

var policies

var useURL = baseURL + "/" + organization + "/" + project + "/" + restApiStr + "/" + restApiAction
// useURL += ("/" + azdoQueryId)
console.log("URL to send: " + useURL + " \n")
// var req = unirest("GET", "https://dev.azure.com/{organization}/{project}/_apis/wit/queries?api-version=5.1-preview.2")
// this is the URL to try
// var urlTest = "https://dev.azure.com/DevDiv/DevDiv/_apis/wit/queries?api-version=5.1-preview.2"

var req = unirest("GET", useURL)

// var auth = 'Basic ' + Buffer.from(username + ':' + pat).toString('base64');
// var authStr = 'Basic' + (" :" + pat).toString('base64');  // don't include username with a PAT

req.auth({
    user: "",
    pass: pat,
    sendImmediately: true
})

// req.query( queryStr2 )
req.query(queryStr)

function lookupNameReq(userID) {
    var baseURL = "https://vssps.dev.azure.com"
    var restApiStr = "_apis/graph"
    var restApiAction = "users"
    var queryStr = "api-version=5.1"
    var useURL = baseURL + "/" + organization + "/" + restApiStr + "/" + restApiAction
    useURL += userID
    var req = unirest("GET", useURL)
    req.query(queryStr)
    req.auth({
        user: "",
        pass: pat,
        sendImmediately: true
    });
    return req;
}

function getNameFromId(userID) {
    lookupNameReq(userID).end(function (res) {
            var reply = res.body;
            console.log( 'userID is: ' + userID);
            console.log("lookup result is: " + reply );
            var replyResult = JSON.parse( reply );

        }
    );
}


req.end(function (res) {
    //if (res.error) throw new Error(res.error)
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
    console.log("\n\nPolicy API Returned:\nResponse code: " + res.code)
    console.log("  status type: " + respStatus)
    console.log("Originalrequest:\n" + JSON.stringify(res.request, null, '\t'))
    console.log("\n\nResponse:\n")
    if (res.error) {
        console.warn(res.error)
    } else {
        // console.log(res.body)
        // policies = JSON.parse(res.body);
        console.log("count is: " + res.body.count);
        var policies = res.body.value;
        console.log("first policy has ID: " + policies[0]["id"]);
        console.log("    and the type is: " + policies[0]["type"]["displayName"]);
        console.log("    and the reviewer ID are: " + policies[0]["settings"]["requiredReviewerIds"]);
        console.log("    and the reviewer names are: ");
        var userID = policies[0]["settings"]["requiredReviewerIds"][0] 
            console.log('       calling with userID: ' + userID );
            console.log('          ' + getNameFromId(userID));
        
        console.log("\nNow processing the policies ..... \n")
        var interstingPolicies = getPoliciesByType("Required reviewers", policies);
        // console.log( JSON.stringify( interstingPolicies, null, '\t' ));
        console.log("  Number of Required Reviewer policies: " + Object.keys(interstingPolicies).length);

    }
})


function getPoliciesByType(type, policies) {
    return policies.filter(
        function (policies) {
            return policies.type.displayName == type
        }
    );
}