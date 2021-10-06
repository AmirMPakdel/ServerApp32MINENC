const express = require('express')
const multer  = require('multer')
const uploadCheck = require('./handlers/uploadCheck')
const uploadProgress = require('./handlers/uploadProgress')
const savingCheck = require('./handlers/savingCheck')
const { sendViaFTP } = require('./utils/downloadhost')

const upload = multer({ dest: 'uploads/' })
const app = express()

const port = 8020

app.post('/upload_check', uploadCheck);

app.post('/upload_progress', upload.single('akbar'), uploadProgress);

app.post('/saving_check', savingCheck);

sendViaFTP().then(()=>{
    console.log("done!")
})

app.listen(port, () => {
  console.log(`convertor listening at http://localhost:${port}`)
})