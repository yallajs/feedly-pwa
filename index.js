const express = require('express');
const fetch = require("node-fetch");
const bodyParser = require('body-parser');
const stripTags = require('strip-tags');
const app = express();
const cache = {};
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/api/*', (req, res) => {
  let api = req.originalUrl.substring('/api/'.length,req.originalUrl.length);
  getApi(api).then((json)=> res.status(200).send(json)).catch(err => {
    res.send(err);
  });
});

app.get('/clean-address',(req,res) => {
    let address = req.originalUrl.substr('/clean-address?address='.length,req.originalUrl.length);

    fetch(address).then(result => result.text())
        .then(text => {
            res.status(200).send(text);
        })
        .catch(err => {
            res.send(err);
        });
});

app.post('/api/*', (req, res) => {
  let api = req.originalUrl.substring('/api/'.length,req.originalUrl.length);
  postApi(api,req.body).then((json)=> res.status(200).send(json)).catch(err => {
    res.send(err);
  });
});

const headers = {
    // api feedly.cetc@gmail.com
   //'Authorization': 'OAuth AywbKsSPN4YKjd9EEEqiaHxRtP2gg5jwQ7idyBkTtmp3WGZ3SAuZBzm5dvecS3Rp7T7QPaBqdNKRpLL7JtjL_IyCozVnZmvneAwmVMx-tgK2bvecM-Dumsl3MUNGDQhU035HijdQJQOfi2BLhp-cWcCJUq2gyWJaw-vFYSz2cbCravhUCQHRuUXIrSjMe6XvJ7Mbo7S__WCnSI4sdjeJ1bHt61vZpAp0mmT2HV_UGD24jdh3_nlLLg:feedlydev',

    // api a.arif.r@gmail.com
    'Authorization': 'OAuth AzFBhsTiMC_0vqn7RsQPI_5OWHi1nZMvy9w4Ob2Jcqd4-whS2Xf6DkbsBK_QHWp4O8kVlU8BeCbXTrYgLL-Db7l-Z6U6YGCfl6WSNr_8_J8UpQRnC_dWPgQWYAzuPc_MMhXPc5kh1de_uwd6K6Pi5q8iAt0sR4QZmFkZNVG-zETS2bbNS_u9pm-mbTcB6OoxiV29fKofv4dVe37VQwgr1qwp3ijtyaZo9NJE5jxlB_WRlnUV7pHg9g:feedlydev',
   'Accept': 'application/json',
   'Content-Type': 'application/json'
};


const oneMinute = 1000*60;
const oneHour = oneMinute * 60;
const eightHours = oneHour*8;
function getApi(api){
    let apiAddressUrl = `https://cloud.feedly.com/${api}`;
    let apiAddressKey = apiAddressUrl.substr(0,apiAddressUrl.indexOf("&continuation"));
    if(apiAddressKey in cache){
        console.log('We have the api in cache ',apiAddressKey);
        let cacheDate = cache[apiAddressKey].date;
        if(new Date().getTime() - cacheDate.getTime() < eightHours){
            return Promise.resolve(cache[apiAddressKey].response);
        }
    }
	return fetch(apiAddressUrl,{headers: headers}).then(resolve => resolve.json()).then(response => {
	    console.log('storing to cache ',apiAddressKey,response);
	    cache[apiAddressKey] = {date : new Date() , response};
	    return response;
    });
}

function postApi(api,body){
	return fetch(`https://cloud.feedly.com/${api}`,{headers: headers,method:'POST',body:body}).then(resolve => resolve.json());
}


if (module === require.main) {
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}
