const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/compile',async (req,res)=>{
    const {code,lang,input} = req.body 
     const fetch_response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: "f608249a407ffb24c664f73e220a8cb",
        clientSecret:
          "91e58d3c9ea93ef75f88dd1a0f91ec4df2811f23a32c85de24efafef3e1c2807",
        script: code,
        stdin: input,
        language: lang,
        versionIndex: "0"
      })
    })
     const d = await fetch_response.json();
     res.json(d);
});


app.listen(3000,()=>console.log("Server listening on port 3000"));
