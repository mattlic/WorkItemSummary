var unirest = require("unirest"); 
 
var organization = "DevDiv";
var project = "DevDiv"
username = "mattlic@microsoft.com";
pat = "ny57ltjnw6oku5gwel6g3pnfifcdamwpj5y64npu7fpolis6tnga"

var req = unirest("GET", "https://dev.azure.com/{organization}/{project}/_apis/wit/queries?api-version=5.1-preview.2")
var auth = 'Basic ' + Buffer.from(username + ':' + pat).toString('base64');

req.headers({
    "Authorization" : auth
})
 
req.end(function (res) {
        if (res.error) throw new Error(res.error)
        console.log(res.body)
})