const Database = require("../utils/database");
const fs = require("fs");
const statics = require("../statics");
const env = require("../env");

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
function uploadProgress(req, res){

    if(req.file){

        let {
            
            tenant,
            upload_id,
            upload_key,

        } = req.body;

        Database.getUploadsRow(
            {
                tenant,
                id:upload_id,
                upload_key,
            },
            (err1, result1)=>{

                let row = result1[0];

                if(err1){

                    deleteTempFile(req.file);

                    statics.sendError(res, err1, "fetching row from sql failed");

                }else if(!row){

                    deleteTempFile(req.file);

                    //wrong id or temp_key
                    statics.sendError(res, "1", "uploadProgress->wrong id or temp_key", statics.INVALID_UPLOAD_KEY);

                }else{

                    //comparing the sizes
                    if(row.size !== req.file.size){

                        deleteTempFile(req.file);

                        //not the same file with the same size
                        statics.sendError(res, "1", "uploadProgress->not the same file with the same size", statics.SIZES_NOT_EQUAL);

                    }else{

                        fs.rename("./uploads/"+req.file.filename, env.UPLOAD_READY_PATH+upload_key, (err2) => {

                            if (err2){

                                //not the same file with the same size
                                statics.sendError(res, err2, "uploadProgress->rename and moving file failed");

                            }else{

                                // success
                                statics.sendData(res, {});
                            }
                        });
                    }
                }
            }
        )

    }else{

        //no file found in request
        statics.sendError(res, "1", "uploadProgress->no file found in request", statics.FILE_NOT_FOUND);
    }
}

function deleteTempFile(file, cb){

    fs.unlink("./uploads/"+file.filename, (err)=>{
        if(!err){
            if(cb)cb();
        }else{
            statics.criticalInternalError(err, "uploadProgress->deleteTempFile");
        }
    });
}

module.exports = uploadProgress;