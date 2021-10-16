const express = require('express')
const multer  = require('multer')
const uploadCheck = require('./handlers/uploadCheck')
const uploadProgress = require('./handlers/uploadProgress')
const getUploadObj = require('./handlers/getUploadObj')
const Manager = require('./utils/Manager')
const moveToFtp = require('./handlers/moveToFtp')

const upload = multer({ dest: 'uploads/' })
const app = express()

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const port = 8020

Manager.init();

app.get("/test", (req,res)=>{res.send("Hello World")});

app.post('/upload_check', uploadCheck);

app.post('/upload_progress', upload.single('mfile'), uploadProgress);

app.post('/moveToFtp', moveToFtp);

app.post('/getUploadObj', getUploadObj);


app.listen(port, () => {
  console.log(`convertor listening at http://localhost:${port}`)
})