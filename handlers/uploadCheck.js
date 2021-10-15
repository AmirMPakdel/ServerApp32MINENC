const { default: axios } = require("axios");
const statics = require("../statics");
const Database = require("../utils/database");

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
function uploadCheck(req, res){
    
    let {

        token,
        upload_key, // generated in main_server

    } = req.body;

    //TODO: set axios real request to main server
    setTimeout((req, res)=>{

        let d1 = {
            result_code:statics.SUCCESS,
            data:{
                upload_key:"bfad-dl23l3l4-l5k4b45jl3j",
                encrypt:true,
                public:false,
                file_size:1428135, 
                file_type:"mp4",
            }
        }

        if(d1.result_code === statics.SUCCESS){

            //TODO: check local diskspace
            //TODO: check dlhost diskspace

            d2 = d1.data;

            Database.saveUploadInfo(
                {
                    upload_key: d2.upload_key,
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
        
    }, 1500, req, res);
}

module.exports = uploadCheck;