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

    let upload_keys = [];

    if(Array.isArray(upload_key)){

        upload_keys = upload_key;

    }else{

        upload_keys = [upload_key];
    }


    let promises = [];

    upload_keys.forEach(el=>{

        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all#promise.all_fail-fast_behavior
        
        //handling the fast-rejection with .catch(e=>e)
        promises.push(movingPromise(el, enc_key).catch(e=>e));
    });

    let response_array = [];

    Promise.all(promises).then((result)=>{

        result.forEach(({error, message, input, result_code})=>{

            if(error){

                response_array.push({result_code, error, message, input});

            }else{

                response_array.push({result_code, data:{}, input});
            }

        });

        statics.sendResponseArray(res, response_array);

    });
}

function movingPromise(upload_key, enc_key){
    
    return new Promise((resolve, reject)=>{

        let input = {upload_key, enc_key};

        Database.getUploadByUploadKey(upload_key, (err1, result)=>{

            if(!err1){
    
                let row = result[0];
    
                if(row){
    
                    if(row.encrypt){
    
                        if(enc_key && enc_key.length===16){
    
                            Database.setUploadEncKey(upload_key, enc_key, (err2, result)=>{
    
                                if(!err2){
        
                                    movingTheFile(row, ({error, message, result_code})=>{

                                        resolve({result_code, error, message, input});
                                    });
        
                                }else{
        
                                    reject({result_code:statics.SERVER_ERROR, error:err2, message:"moveTOFtp->updating upload obj failed", input});
                                }
                            });
    
                        }else{
    
                            reject({result_code:statics.SERVER_ERROR, error:"1", message:"missing a valid 16 character 'enc_key", input});
                        }
    
                    }else{
    
                        movingTheFile(row, ({error, message, result_code})=>{

                            resolve({result_code, error, message, input});
                        });
                    }
    
                }else{
    
                    //row not found
                    reject({result_code:statics.INVALID_UPLOAD_KEY, error:"1", message:"moveTOFtp->row not found", input});
                }
    
            }else{
    
                //problem in fetching the upload obj
                reject({result_code:statics.SERVER_ERROR, error:err1, message:"moveTOFtp->problem in fetching the upload obj", input});
            }
        });
    });
}

function movingTheFile(row, cb) {

    fs.rename("./upload_ready/"+row.upload_key, "./ftp_normal/"+row.upload_key+"."+row.type, (err) => {

        if(!err){
            
            //success
            cb({result_code:statics.SUCCESS});

        }else{

            //change files path and name failed
            cb({error:err, message:"moveTOFtp->change files path and name failed", result_code:statics.SERVER_ERROR});
        }
    });
}

module.exports = moveToFtp;