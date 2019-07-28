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
    console.log("\n\nResponse:\n")
    if (res.error) {
        console.log("\n\nPolicy API Returned:\nResponse code: " + res.code)
        console.log("  status type: " + respStatus)
        console.log("Originalrequest:\n" + JSON.stringify(res.request, null, '\t'))
        console.warn(res.error)
    } else {
        // console.log(res.body)
        // policies = JSON.parse(res.body);
        console.log("count is: " + res.body.count);
        var policies = res.body.value;

        console.log("\nNow processing the policies ..... \n")
        var interstingPolicies = getPoliciesByType("Required reviewers", policies);
        // console.log( JSON.stringify( interstingPolicies, null, '\t' ));
        console.log("  Number of Required Reviewer policies: " + Object.keys(interstingPolicies).length);

        console.log("Second reviewer policy has ID: " + interstingPolicies[2]["id"]);
        console.log("    and the type is: " + interstingPolicies[2]["type"]["displayName"]);
        console.log("    and the reviewers are: " + getReviewerInfo(interstingPolicies[2]));

    }
})


function getPoliciesByType(type, policies) {
    return policies.filter(
        function (policies) {
            return policies.type.displayName == type
        }
    );
}


function getReviewerInfo(reviewerPolicy) {
    console.log('  policy ID: ' + reviewerPolicy.id);
    console.log('  requiredReviewerIds: ' + reviewerPolicy["settings"]["requiredReviewerIds"]);
    var reviewerData = [];
    var name;

    reviewerPolicy["settings"]["requiredReviewerIds"].forEach(function (reviewer) {
        name = getNameFromId(reviewer);
        console.log('  composing return value with -   name: ' + name + ', id: ' + reviewer);
        reviewerData.concat({
            '    name': name,
            '    id': reviewer
        });
    });
    return reviewerData;
}

function getNameFromId(userID) {
    var descriptor = lookupIdStorageUser( lookupStorageIDReq( userID ) );
    var name = lookupDescriptorNameuser( lookupDescriptorNameReq( descriptor ) );
    console.log( '   userID: ' + userID + ' , Descriptor: ' + descriptor + ' , Name: ' + name );
    return name;
}


function lookupIdStorageUser(userIdReq) {
    lookupDescriptorNameReq(userIdReq).end(function (res) {
        var reply = res.body;
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
        if (res.error) {
            console.log("\n\nGetName API Returned:\nResponse code: " + res.code)
            console.log("  status type: " + respStatus)
            console.log("Originalrequest:\n" + JSON.stringify(res.request, null, '\t'))
            console.log("\n\nResponse:\n")
            console.warn(res.error)
        } else {
            // console.log('user Descriptor is: ' + userID);
            console.log("lookup result is: " + reply);
            // var replyResult = JSON.parse( reply );
            var descriptor = reply.value;
            console.log('   Descriptor: ' + descriptor);
            return descriptor;
        }
    });
}

function lookupDescriptorNameuser(userDescriptorReq) {
    lookupDescriptorNameReq(userDescriptorReq).end(function (res) {
        var reply = res.body;
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
        if (res.error) {
            console.log("\n\nGetName API Returned:\nResponse code: " + res.code)
            console.log("  status type: " + respStatus)
            console.log("Originalrequest:\n" + JSON.stringify(res.request, null, '\t'))
            console.log("\n\nResponse:\n")
            console.warn(res.error)
        } else {
            // console.log('user Descriptor is: ' + userID);
            console.log("lookup result is: " + reply);
            // var replyResult = JSON.parse( reply );
            var name = reply.displayName;
            var email = reply.mailAddress;
            console.log('  name: ' + name + ', email: ' + email);
            return name;
        }
    });
}

function lookupDescriptorNameReq(userDescriptor) {
    var baseURL = "https://vssps.dev.azure.com"
    var restApiStr = "_apis/graph"
    var restApiAction = "users"
    var queryStr = "api-version=5.1"
    var useURL = baseURL + "/" + organization + "/" + restApiStr + "/" + restApiAction + "/" + userDescriptor
    var req = unirest("GET", useURL)
    req.query(queryStr)
    req.auth({
        user: "",
        pass: pat,
        sendImmediately: true
    });
    return req;
}

function lookupStorageIDReq(userID) {
    var baseURL = "https://vssps.dev.azure.com"
    var restApiStr = "_apis/graph"
    var restApiAction = "descriptors"
    var queryStr = "api-version=5.1"
    var useURL = baseURL + "/" + organization + "/" + restApiStr + "/" + restApiAction + "/" + userID
    var req = unirest("GET", useURL)
    req.query(queryStr)
    req.auth({
        user: "",
        pass: pat,
        sendImmediately: true
    });
    return req;
}





/*
    console.log("    and the reviewer names are: ");
        var userID = interstingPolicies[1]["settings"]["requiredReviewerIds"][0] 
            console.log('       calling with userID: ' + userID );
            console.log('          ' + getNameFromId(userID));
        
*/