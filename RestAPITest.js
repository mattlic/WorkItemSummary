"use strict";

const unirest = require("unirest");

var testArg = process.argv[2]
if ( testArg ) testArg = testArg.toLowerCase();

const tests = ["quick", "query", "policy"];

const baseURL = "https://dev.azure.com";
const organization = "DevDiv";
const project = "DevDiv";
const username = "mattlic@microsoft.com";
const pat = "ny57ltjnw6oku5gwel6g3pnfifcdamwpj5y64npu7fpolis6tnga";
// var req;

// var req = unirest("GET", "https://dev.azure.com/{organization}/{project}/_apis/wit/queries?api-version=5.1-preview.2")
// this is the URL to try
// var urlTest = "https://dev.azure.com/DevDiv/DevDiv/_apis/wit/queries?api-version=5.1-preview.2"

if ( testArg != "all") {
    runTest( testArg );
} else {
    for (var testNum in tests) {
        console.log( "testName = " + tests[testNum] );
        runTest( tests[testNum] );
    }
}

function runTest( testName ) {
    makeApiCall( testToRun( testName ))
}

// the function that 
function  testToRun( testSelection ) {
    switch (testSelection) {
        case tests[0]:
        default:
            console.log("running test for: " + tests[0]);
            var restApiStr = "_apis/wit" ;
            var restApiAction = "queries" ;
            var azdoQueryId = '8edae917-512a-491b-89b5-3ba761394e46' ;
            var queryStr = "api-version=5.1-preview.2" ;
            var queryStr2 = "$depth=0";

            var useURL = baseURL + "/" + organization + "/" + project + "/" + restApiStr + "/" + restApiAction ;
            useURL += ("/" + azdoQueryId);
            console.log("URL to send: " + useURL + " \n");
            var req = unirest("GET", useURL);

            req.query(queryStr2);
            req.query(queryStr);
            return req;
            break;
        case tests[1]:
            console.log("running test for: " + tests[1])
            var restApiStr = "_apis/wit"
            var restApiAction = "queries"
            var azdoQueryId = '8edae917-512a-491b-89b5-3ba761394e46'
            var queryStr = "api-version=5.1-preview.2"
            var queryStr2 = "$depth=1";

            var useURL = baseURL + "/" + organization + "/" + project + "/" + restApiStr + "/" + restApiAction
            useURL += ("/" + azdoQueryId)
            console.log("URL to send: " + useURL + " \n")
            var req = unirest("GET", useURL)

            req.query(queryStr2)
            req.query(queryStr)
            return req;
            break;
        case tests[2]:
            console.log("running test for: " + tests[2])
            var restApiStr = "_apis/policy"
            var restApiAction = "configurations"
            var queryStr = "api-version=5.1"

            useURL = baseURL + "/" + organization + "/" + project + "/" + restApiStr + "/" + restApiAction
            console.log("URL to send: " + useURL + " \n")
            var req = unirest("GET", useURL)

            req.query(queryStr)
            return req;
            break;
    }
}

function makeApiCall( req ) {
    // Send the REST API call and get results
    var authStr = 'Basic' + (" :" + pat).toString('base64'); // don't include username with a PAT
    req.auth({
        user: "",
        pass: pat,
        sendImmediately: true
    })
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
        console.log("\n\nReturned:\nResponse code: " + res.code)
        console.log("  status type: " + respStatus)
        console.log("Originalrequest:\n" + JSON.stringify(res.request, null, '\t'))
        console.log("\n\nResponse:\n")
        if (res.error) console.warn(res.error)
        else console.log(res.body)
    })
}

