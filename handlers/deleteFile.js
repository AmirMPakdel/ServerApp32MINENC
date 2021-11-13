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

    if(Array.isArray(upload_key)){

        upload_keys = upload_key;

    }else{

        upload_keys = [upload_key];
    }

    
    let promises = [];

    upload_keys.forEach(el=>{

        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all#promise.all_fail-fast_behavior
        
        //handling the fast-rejection with .catch(e=>e)
        promises.push(deleteSinglFilePromise(el, tenant).catch(e=>e));
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

function deleteSinglFilePromise(upload_key, tenant){

    return new Promise((resolve, reject)=>{

        let input = {upload_key, tenant};

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
                            
                                resolve({error: false, input, result_code:statics.SUCCESS});
                            
                            }else{
                                
                                reject({error:err, message:"deleteFile->deletRowByUploadKey->couldn't delete the upload row from db", 
                                input, result_code:statics.SERVER_ERROR});
                            }
                        });
    
                    }).catch(e=>{
    
                        reject({error:e, message:"deleteFile->removing file via ftp failed", input, result_code:statics.SERVER_ERROR});
                    });
    
                }else{
    
                    reject({error:"1", message:"deleteFile->upload_obj not found. wrong tenant", input, result_code:statics.INVALID_TENANT});
                }
    
            }else if(err){
    
                reject({error:err, message:"deleteFile->error on fetching the upload_obj", input, result_code:statics.SERVER_ERROR});

            }else{

                reject({error:"1", message:"deleteFile->upload_obj not found. wrong upload_key", input, result_code:statics.INVALID_UPLOAD_KEY});
            }
        });
    });
}

module.exports = deleteFile;