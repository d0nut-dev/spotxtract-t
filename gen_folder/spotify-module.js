const https = require("https");

const CLIENT_ID = "Your CLIENT_ID";
const CLIENT_SECRET = "Your CLIENT_SECRET";

async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const options = {
      method: "POST",
      host: "accounts.spotify.com",
      path: "/api/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const accessToken = JSON.parse(data).access_token;
        resolve(accessToken);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write("grant_type=client_credentials");
    req.end();
  });
}

async function getPlaylistData(playlistURI) {
  const accessToken = await getAccessToken();
  const playlistID = playlistURI.split(":")[2];

  const options = {
    method: "GET",
    host: "api.spotify.com",
    path: `/v1/playlists/${playlistID}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const playlistData = JSON.parse(data);
        resolve(playlistData);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

module.exports = {
  getPlaylistData,
};
