const { default: axios } = require("axios");
const statics = require("../statics");
const Database = require("../utils/database");
const { uploadKeyCheck } = require("../utils/mainServer");

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
function uploadCheck(req, res){
    
    let {
        token,
        file_type,
        upload_type, //(exp. educator_avatar)
        course_id, //(nullable)

        tenant,
        upload_key, // generated in main_server

    } = req.body;

    //TODO: validate inputs

    uploadKeyCheck(req, res, (err1, d1)=>{

        if(!err1){

            d1 = d1.data;

            if(d1.result_code === statics.SUCCESS){

                //TODO: check local diskspace
    
                //TODO: check dlhost diskspace
    
                let {

                    file_type,
                    file_size,
                    is_encrypted,
                    is_public,

                } = d1.data;
    
                Database.saveUploadInfo(
                    {
                        upload_key,
                        tenant,
                        size: file_size,
                        type: file_type,
                        encrypt: is_encrypted,
                        public: is_public,
                    },
                    (err, result)=>{
    
                        if(err){
    
                            statics.sendError(res, err, "uploadCheck->saving upload info error");
    
                        }else{
    
                            // tell user its ok to upload ur file
                            let data = {
                                upload_id: result.insertId,
                                upload_key: d1.upload_key,
                                info: result,
                            }
                            statics.sendData(res, data);
                        }
                    }
                )
    
            }else{
    
                statics.sendError(res, "1", "uploadCheck->upload rejected from main server", d1.result_code);
            }


        }else{
            
            statics.sendError(res, err1, "uploadCheck->request to main server failed", statics.SERVER_ERROR);

            statics.criticalInternalError(err1, "uploadCheck->request to main server failed");

        }
    })
}

module.exports = uploadCheck;