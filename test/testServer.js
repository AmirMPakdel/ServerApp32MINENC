const express = require('express');
const multer  = require('multer');
const uploadCheck = require('../controllers/uploadCheck');
const uploadProgress = require('../controllers/uploadProgress');
const getUploadObj = require('../controllers/getUploadObj');
const Manager = require('../utils/manager');
const moveToFtp = require('../controllers/moveToFtp');
const deleteFile = require('../controllers/deleteFile');
const cors = require("cors");
const env = require('../env');

const upload = multer({ dest: env.TEMP_STAGE_DIR });
const app = express();

const corsOpts = {
  origin: '*',
  methods: ['GET','POST'],
  allowedHeaders: ['Content-Type', 'X-TENANT'],
};

app.use(cors(corsOpts));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const port = 8020;

const manager_config = {
  MANAGER_CHECK_INTERVAL: 5 * 1000,
  UPLOAD_EXPIRE_TIME: 3600 * 1000,
  MANAGER_UPLOAD_EXPIRE_INTERVAL: 640 * 1000,
}

const manager = new Manager(manager_config);
manager.init();

app.get("/test", (req,res)=>{res.send("Hello World")});

app.post('/upload_check', uploadCheck);

app.post('/upload_progress', upload.single('mfile'), uploadProgress);

app.post('/moveToFtp', moveToFtp);

app.post('/getUploadObj', getUploadObj);

app.post('/delete_file', deleteFile);


function run(cb){
  app.listen(port, () => {
    console.log(`test server listening on port ${port}`);
    cb();
  });
}

module.exports = {run};