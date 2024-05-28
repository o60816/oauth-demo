const util = require("util");
const { logger } = require("../../utils/logger");
const request = require("request");

// https://developers.google.com/identity/protocols/oauth2/native-app?hl=en

/*
* Steps:
* 1. Access website below for user to login on Google
* https://accounts.google.com/o/oauth2/v2/auth?scope=email%20profile&response_type=code&redirect_uri=${your_redirect_uri}&client_id=${your_client_id}
* You may need to get client_id, client_secret and set redirect_uri from https://console.cloud.google.com/apis/dashboard
* 2. Once the user login successfully, Goggle will redirect to uri you set on the website above 
* e.g. http://localhost:8080/users/oauth?code=[get_auth_code_here]&scope=email+profile+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+openid&authuser=0&prompt=none
* 3. Use client_id, client_secret, redirect_uri from Google website and auth code from request URL to get access_token
* the format for POST /token should be application/x-www-form-urlencoded
* e.g. code=${autho_code}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&grant_type=authorization_code
* 4. Get access_token from URLhttps://oauth2.googleapis.com/token through POST
* e.g. 
{
  "access_token": "1/fFAGRNJru1FTz70BzhT3Zg",
  "expires_in": 3920,
  "token_type": "Bearer",
  "scope": "https://www.googleapis.com/auth/drive.metadata.readonly",
  "refresh_token": "1//xEoDL4iW3cxlI7yDbSRFYNG01kVKM2C-259HOF2aQbI"
}
* 5. Get user info through access_token e.g. https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokenBody.access_token}
* e.g.
{
  id: '12371726381273612',
  email: 'xiaomingchen@gmail.com',
  verified_email: true,
  name: '陳小明',
  given_name: '小明',
  family_name: '陳',
  picture: 'https://lh3.googleusercontent.com/a-/xxx',
  locale: 'zh-TW'
}
*/
async function oauthLogin(req, res) {
  try {
    if (!req?.query?.code) {
      throw "OAuth with Google failed";
    }
    let tokenBody = JSON.parse(
      await (async () => {
        return new Promise((resolve, reject) => {
          // Get those infos from
          let clientId = process.env.CLIENT_ID;
          let clientSecret = process.env.CLIENT_SECRET;
          let redirectUri = "http://localhost:8080/users/oauth";
          // Get access_token through auth code get from req query params req.query.code
          let authCode = req.query.code;
          logger.info(`${util.inspect(req.query, false, null, true)}`);
          let data = `code=${authCode}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&grant_type=authorization_code`;
          logger.info(`${util.inspect(data, false, null, true)}`);
          request.post(
            {
              headers: { "content-type": "application/x-www-form-urlencoded" },
              url: "https://oauth2.googleapis.com/token",
              body: data,
            },
            function (err, response, body) {
              if (err) {
                reject(err);
              } else {
                resolve(body);
              }
            }
          );
        });
      })()
    );

    logger.info(`Access Token ${util.inspect(tokenBody, false, null, true)}`);

    if (!tokenBody?.access_token) {
      throw "OAuth with Google failed";
    }
    let userInfo = JSON.parse(
      await (async () => {
        return new Promise((resolve, reject) => {
          let userInfoUri = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokenBody.access_token}`;
          request(
            {
              uri: userInfoUri,
            },
            function (err, response, body) {
              if (err) {
                reject(err);
              } else {
                resolve(body);
              }
            }
          );
        });
      })()
    );
    logger.info(`User info ${util.inspect(userInfo, false, null, true)}`);
    res.render("index", { title: userInfo.name });
  } catch (err) {
    logger.error(err);
  }
}

module.exports = {
  oauthLogin,
};
