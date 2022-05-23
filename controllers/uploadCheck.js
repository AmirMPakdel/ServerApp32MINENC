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

            if(d1.result_code === statics.mainServerStatics.SUCCESS){

                //TODO: check local diskspace
    
                //TODO: check dlhost diskspace
    
                let {

                    file_type,
                    file_size,
                    is_encrypted,
                    is_public,
                    upload_type,

                } = d1.data;

                let free = UploadType2Free(upload_type);
    
                Database.saveUploadInfo(
                    {
                        upload_key,
                        tenant,
                        size: file_size,
                        type: file_type,
                        encrypt: is_encrypted,
                        public: is_public,
                        free,
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

const UploadType2Free = (upload_type)=>{

    let not_free_upload_types = [
        "ut_course_video",
        "ut_course_voice",
        "ut_course_document",
    ]

    let free = true;

    not_free_upload_types.forEach(e=>{
        if(e === upload_type){
            free = false;
        }
    });

    return free;
}

module.exports = uploadCheck;