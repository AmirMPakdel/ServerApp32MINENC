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

    getUploadByUploadKey(upload_key, (err, data)=>{

        data = data[0];

        console.log(data);

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
                        
                            statics.sendData(res, {}, statics.SUCCESS);
                        
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

}

module.exports = deleteFile;