const statics = require("../statics");
const Database = require("../utils/database");

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
 function getUploadObj(req, res){
    
    let {
        
        upload_key

    } = req.body;

    //TODO: set a main_server access_key so others won't access this data

    Database.getUploadByUploadKey(upload_key, (err, result)=>{

        if(!err && result[0]){

            result[0].enc_key = null;

            statics.sendData(res, result[0]);

        }else{

            //wrong uploadkey. row not found
            statics.sendError(res, err, "getUploadObj->row not found", statics.INVALID_UPLOAD_KEY);
        }
    });
}

module.exports = getUploadObj;