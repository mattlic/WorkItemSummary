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
    var reviewerIds = reviewerPolicy["settings"]["requiredReviewerIds"];
    console.log('  requiredReviewerIds: ' + reviewerIds);
    var reviewerData = [];
    var name;

    reviewerIds.forEach(function (reviewer) {
        var reviewerString = reviewer.toString();
        // console.log('Reviewer ID sent to getNameFromID is: ' + reviewerString + '  of type: ' + typeof reviewer)
        getNameFromId(reviewerString).then( function (name) {
            console.log('  composing return value with -   name: ' + name + ', id: ' + reviewerString);
            reviewerData.concat({
                'name': name,
                'id': reviewerString
            });
        });
    });
    return reviewerData;
}

function getNameFromId(userID) {
    /*   lookupIdStorageUser(lookupStorageIDReq(userID), function (descriptor) {
            lookupDescriptorNameuser(lookupDescriptorNameReq(descriptor));
            console.log('   userID: ' + userID + ' , Descriptor: ' + descriptor + ' , Name: ' + name);
            return name;
        })
    */
    console.log('  userID is: ' + userID);
    return new Promise((resolve, reject) => {
        descriptor = lookupIdStorageUser(lookupStorageIDReq(userID));
        if (descriptor) {
            resolve(descriptor);
        } else {
            reject('unknown');
        }
    }).then(function (descriptor, error) {
        if (descriptor) {
            return new Promise((resolve, reject) => {
                console.log('  will look up descriptor: ' + descriptor);
                nameData = lookupDescriptorName(descriptor);
                if (nameData) {
                    console.log("  nameDate is:\n" + JSON.stringify(nameData, null, '\t'))
                    console.log('  Redolved nameData as: ' + nameData.name)
                    resolve(nameData.name)
                } else {
                    reject('unknown');
                }
            });
        } else {
            reject(error);
        }
    }).then(function (name) {
        return name;
    });
}





function lookupIdStorageUser(userIdReq) {
    userIdReq.end(function (res) {
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
            console.log("\n\nGet Descriptor API Returned:\nResponse code: " + res.code)
            console.log("  status type: " + respStatus)
            console.log("Originalrequest:\n" + JSON.stringify(res.request, null, '\t'))
            console.log("\n\nResponse:\n")
            console.warn(res.error)
        } else {
            var reply = res.body;
            // console.log('user Descriptor is: ' + userID);
            // console.log("Originalrequest:\n" + JSON.stringify(res.request, null, '\t'))
            // console.log("ID lookup result is: " + JSON.stringify(reply, null, '\t'));
            // var replyResult = JSON.parse( reply );
            var descriptor = reply.value;
            console.log('   Found descriptor: ' + descriptor);
            return descriptor;
        }
    });
}

function lookupDescriptorName(userDescriptor) {
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
    console.log('  userDescriptor is: ' + userDescriptor);
    console.log('  useURL is: ' + useURL);
    req.end(function (res) {
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
            console.log("Descriptor lookup result is: " + JSON.stringify(reply, null, '\t'));
            // var replyResult = JSON.parse( reply );
            var name = reply.displayName;
            var email = reply.mailAddress;
            console.log('  name: ' + name + ', email: ' + email);
            // nameData = [{ 'name' : name,  'email' : email }];
            return [{
                'name': name,
                'email': email
            }];
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
    console.log('  userDescriptor is: ' + userDescriptor);
    console.log('  useURL is: ' + useURL);
    return req;
}

function lookupStorageIDReq(userID) {
    var baseURL = "https://vssps.dev.azure.com"
    var restApiStr = "_apis/graph"
    var restApiAction = "descriptors"
    var queryStr = "api-version=5.1-preview.1"
    var useURL = baseURL + "/" + organization + "/" + restApiStr + "/" + restApiAction + "/" + userID
    var req = unirest("GET", useURL)
    req.query(queryStr)
    req.auth({
        user: "",
        pass: pat,
        sendImmediately: true
    });
    // console.log( '  userID is: ' + userID);
    // console.log('  ID lookup useURL is: ' + useURL);
    return req;
}





/*
    console.log("    and the reviewer names are: ");
        var userID = interstingPolicies[1]["settings"]["requiredReviewerIds"][0] 
            console.log('       calling with userID: ' + userID );
            console.log('          ' + getNameFromId(userID));
        
*/