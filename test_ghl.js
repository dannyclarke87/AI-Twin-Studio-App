const https = require('https');
https.get('https://rest.gohighlevel.com/v1/contacts/', (res) => {
  console.log(res.statusCode);
});
