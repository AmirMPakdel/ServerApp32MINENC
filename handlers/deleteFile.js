const statics = require("../statics");
const { getUploadByUploadKey, deletRowByUploadKey } = require("../utils/database");
const { deleteViaFTP } = require("../utils/downloadhost");

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
function deleteFile(req, res){

    let {
        upload_key,
        tenant,
    } = req.body;

    let upload_keys = [];

    if(Array.isArray(upload_key_is_array)){

        upload_keys = upload_key;

    }else{

        upload_keys = [upload_key];
    }

    
    let promises = [];

    upload_keys.forEach(e=>{

        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all#promise.all_fail-fast_behavior
        
        //handling the fast-rejection with .catch(e=>e)
        promises.push(deleteSinglFilePromise(e, tenant).catch(e=>e));
    });

    let errors = [];
    let error_messages = [];
    let result_codes = [];
    // errors.push(e.error);
    // error_messages.push(e.error_message);
    // result_codes.push(e.result_codes);

    Promise.all(promises).then(()=>{

        if(errors.length){

            statics.sendError(res, errors, error_messages, result_codes);

        }else{

            statics.sendData(res, {}, statics.SUCCESS);
        }
    });
}

async function deleteSinglFilePromise(upload_key, tenant){

    return new Promise((resolve, reject)=>{

        getUploadByUploadKey(upload_key, (err, data)=>{

            data = data[0];

            if(data){
    
                if(tenant === data.tenant){
    
                    let file_path = "/public_html/";
                    if(data.public){
                        file_path += "public_files/";
                    }else{
                        file_path += "course_media/";
                    }
                    file_path += data.tenant+"/"+data.upload_key+"."+data.type;
    
                    deleteViaFTP(file_path).then(()=>{
    
                        deletRowByUploadKey(data.upload_key, (err, res2)=>{
                           
                            if(!err){
                            
                                resolve();
                            
                            }else{
    
                                statics.sendError(res, err, "deleteFile->deletRowByUploadKey->couldn't delete the upload row from db");
    
                            }
                        });
    
                    }).catch(e=>{
    
                        statics.sendError(res, e, "deleteFile->removing file via ftp failed", statics.SERVER_ERROR);
                    });
    
                }else{
    
                    statics.sendError(res, "1", "deleteFile->upload_obj not found. wrong tenant", statics.INVALID_TENANT);
                }
    
            }else{
    
                statics.sendError(res, "1", "deleteFile->upload_obj not found. wrong upload_key", statics.INVALID_UPLOAD_KEY);
            }
        });
    });
}

module.exports = deleteFile;