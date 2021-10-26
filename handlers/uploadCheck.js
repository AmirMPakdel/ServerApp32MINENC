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
        tenant,
        upload_key, // generated in main_server

    } = req.body;

    //TODO: validate inputs

    //TODO: set axios real request to main server

    uploadKeyCheck(req, res, (err1, data)=>{

        if(!err1){

            if(res2.result_code === statics.SUCCESS){

                //TODO: check local diskspace
    
                //TODO: check dlhost diskspace
    
                d2 = res2.data;
    
                Database.saveUploadInfo(
                    {
                        upload_key,
                        tenant,
                        size: d2.file_size,
                        type: d2.file_type,
                        encrypt: d2.encrypt,
                        public: d2.public,
                    },
                    (err, result)=>{
    
                        if(err){
    
                            statics.sendError(res, err, "uploadCheck->saving upload info error");
    
                        }else{
    
                            // tell user its ok to upload ur file
                            let data = {
                                upload_id: result.insertId,
                                upload_key: d2.upload_key,
                                info: result,
                            }
                            statics.sendData(res, data);
                        }
                    }
                )
    
            }else{
    
                statics.sendError(res, "1", "uploadCheck->upload rejected from main server", statics.UPLOAD_REJECT);
            }


        }else{
            

        }

        
    })
    
}

module.exports = uploadCheck;