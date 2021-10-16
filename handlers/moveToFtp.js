const Database = require("../utils/database");
const fs = require('fs');
const statics = require("../statics");

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
 function moveToFtp(req, res){
    
    let {

        upload_key,
        enc_key, // if the file is encrypted get an 16char string from main_server

    } = req.body;

    if(!enc_key){
        enc_key = null;
    }

    Database.getUploadByUploadKey(upload_key, (err1, result)=>{

        if(!err1){

            let row = result[0];

            if(row){

                if(row.encrypt){

                    if(enc_key && enc_key.length===16){

                        Database.setUploadEncKey(upload_key, enc_key, (err2, result)=>{

                            if(!err2){
    
                                movingTheFile(res, row);
    
                            }else{
    
                                statics.sendError(res, err2, "moveTOFtp->updating upload obj failed");
                            }
                        });

                    }else{

                        statics.sendError(res, "1", "missing a valid 16 character 'enc_key'");
                    }

                }else{

                    movingTheFile(res, row);
                }

            }else{

                //row not found
                statics.sendError(res, "1", "moveTOFtp->row not found", statics.INVALID_UPLOAD_KEY);
            }

        }else{

            //problem in fetching the upload obj
            statics.sendError(res, err1, "moveTOFtp->problem in fetching the upload obj")
        }
    });
}

function movingTheFile(res, row) {

    fs.rename("./upload_ready/"+row.upload_key, "./ftp_normal/"+row.upload_key+"."+row.type, (err) => {

        if(!err){
            
            //success
            statics.sendData(res, {});

        }else{

            //change files path and name failed
            statics.sendError(res, err, "moveTOFtp->change files path and name failed");
        }
    });
}

module.exports = moveToFtp;