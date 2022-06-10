import express from "express";
import axios from "axios";
const app = express();
import { key } from "./keys.js";
const web = key.web;

import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client({
  clientId: web.client_id,
  clientSecret: web.client_secret,
  redirectUri: 'http://localhost:5000/auth/google/callback'
})


app.get("/", (req, res) => {
    res.send('<a href="/login">Login With Google</a>')
});

app.get("/login", (req, res) => {
    const link = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      response_type: 'code',
      prompt: 'consent'
    })
    res.send(`<a href=${link}>Login Here</a>`)
})

app.get("/auth/google/callback", async (req, res) => {
  console.log("callback hit");
  try {
    const code = req.query.code;
    console.log(code);
    const { tokens } = await client.getToken(code);
    
    const googleUser = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.id_token}`,
        },
      },
    )

    console.log(googleUser.data);
    return res.status(200).json(googleUser.data)

  } catch (error) {
    return res.status(500).json(error)
  }
})


app.listen(5000, (err) => {
    if(err) console.log(err);
    else console.log("Server Started");
})
