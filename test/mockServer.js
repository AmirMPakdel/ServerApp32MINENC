const express = require("express");
const statics = require("../statics");
const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
const port = 8000;

function run(response, cb) {

  app.post("/api/tenant/user/upload/verify", (req, res) => {

    res.json(response);
  });

  app.listen(port, () => {
    
    console.log(`mock server listening on port ${port}`);

    cb();
  });
}

module.exports = {run};
