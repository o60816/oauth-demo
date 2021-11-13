const util = require('util');
const { logger } = require('../../utils/logger');
const request = require('request');

// https://developers.google.com/identity/protocols/oauth2/native-app?hl=en

/*
* Steps:
* 1. Access website below to let user to login on Google
* https://accounts.google.com/o/oauth2/v2/auth?scope=email%20profile&response_type=code&redirect_uri=http://localhost:8080/users/oauth&client_id=${client_id}
* You may need to get client_id, client_secret and set redirect_uri from https://console.cloud.google.com/apis/dashboard
* 2. Once the user login successfully, Goggle will redirect to uri you set on the websive above e.g. http://localhost:8080/user/oauth with auth code
* 3. You can get auth code from req URL query param code http://localhost:8080/users/oauth?code=[get_auth_code_here]&scope=email+profile+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+openid&authuser=0&prompt=none
* 4. Use client_id, client_secret, redirect_uri from Google website and auth code from request URL to get access_token
* the format for POST token should be application/x-www-form-urlencoded 
* e.g. code=${autho_code}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&grant_type=authorization_code
* 5. Get user info through access_token e.g. https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokenBody.access_token}
*/
async function oauthLogin(req, res) {
    try{
        if(!req?.query?.code){
            throw 'OAuth with Google failed';
        }
        let tokenBody = JSON.parse(await (async () => {
            return new Promise((resolve, reject) => {
                // Get those infos from 
                let clientId = process.env.CLIENTID;
                let clientSecret = process.env.CLIENTSECRET;
                let redirectUri = 'http://localhost:8080/users/oauth';
                // Get access_token through auth code get from req query params req.query.code
                let authCode = req.query.code;
                let data = `code=${authCode}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&grant_type=authorization_code`
                request.post(
                    {
                        headers: { 'content-type': 'application/x-www-form-urlencoded' },
                        url: 'https://oauth2.googleapis.com/token',
                        body: data
                    }, function (err, response, body) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(body);
                        }
                    });
            });
        })());
        logger.info(`Access Token ${util.inspect(tokenBody.access_token, false, null, true)}`);

        if(!tokenBody?.access_token){
            throw 'OAuth with Google failed';
        }
        let userInfo = JSON.parse(await (async () => {
            return new Promise((resolve, reject) => {
                let userInfoUri = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokenBody.access_token}`
                request(
                    {
                        uri: userInfoUri
                    }, function (err, response, body) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(body);
                    }
                })
            });
        })());
        logger.info(`User info ${util.inspect(userInfo, false, null, true)}`);
        res.render('index', { title: userInfo.name});
    }catch(err){
        logger.error(err);
    }
}

module.exports = {
    oauthLogin
}