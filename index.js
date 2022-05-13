const express = require('express');
const multer  = require('multer');
const uploadCheck = require('./controllers/uploadCheck');
const uploadProgress = require('./controllers/uploadProgress');
const getUploadObj = require('./controllers/getUploadObj');
const Manager = require('./utils/manager');
const moveToFtp = require('./controllers/moveToFtp');
const deleteFile = require('./controllers/deleteFile');
const cors = require("cors");
const env = require('./env');

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
  MANAGER_CHECK_INTERVAL: env.MANAGER_CHECK_INTERVAL,
  UPLOAD_EXPIRE_TIME: env.UPLOAD_EXPIRE_TIME,
  MANAGER_UPLOAD_EXPIRE_INTERVAL: env.MANAGER_UPLOAD_EXPIRE_INTERVAL,
}

const manager = new Manager(manager_config);
manager.init();

app.get("/test", (req,res)=>{res.send("Hello World")});

app.post('/upload_check', uploadCheck);

app.post('/upload_progress', upload.single('mfile'), uploadProgress);

app.post('/moveToFtp', moveToFtp);

app.post('/getUploadObj', getUploadObj);

app.post('/delete_file', deleteFile);


app.listen(port, () => {
  console.log(`convertor server listening on port ${port}`);
});
