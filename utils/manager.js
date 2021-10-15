const fs = require("fs");
const env = require("../env");
const statics = require("../statics");
const Database = require("./database");
const { sendViaFTP } = require("./downloadhost");
const encryptor = require("./encryptor");

const Manager = {

    status : "sleep",

    /**@type {NodeJs.Timeout} */
    timeout : null,

    init: ()=>{}
}

Manager.init = function(){
    
    //console.log("Manager->init");

    Manager.check();
}

Manager.check = function(){

    //console.log("Manager->check");

    fs.readdir(env.FTP_NRM_PATH, (err, files) => {

        if(!err){

            if(files.length){

                console.log("Manager->check file name ->>>>>"+files[0]);
                Manager.handle(files[0]);


            }else{

                Manager.hibernate();
            }

        }else{

            statics.criticalInternalError(err, "reading the FTP_READY_PATH dir failed")
        }
    });
}

/**
 * 
 * @param {String} file_name 
 */
Manager.handle = function(file_name){

    //console.log("Manager->handle");

    Manager.status = "working";

    let name_array = file_name.split(".");
    let upload_key = name_array[0];
    
    Database.getUploadByUploadKey(upload_key, (err, result)=>{

        if(!err){

            if(result.length){

                let row = result[0];

                if(row.encrypt){

                    Manager.encrypt(row);

                }else{
                    
                    Manager.normal(row);
                }

            }else{

                statics.criticalInternalError("", "Manager->file_name not match any upload key in db")

            }

        }else{

            statics.criticalInternalError(err, "Manager->db error");
        }

    });
}

Manager.encrypt = function(upload_row){

    //console.log("Manager->encrypt");

    encryptor(upload_row.enc_key, upload_row.upload_key, upload_row.id, upload_row.type, (output_path)=>{

        Manager.ftp(upload_row);
    });
}

Manager.normal = function(upload_row){
    
    fs.rename(env.UPLOAD_READY_PATH + upload_row.upload_key, "./ftp_normal/"+upload_row.id+"."+upload_row.type, (err) => {
        
        if(!err){
            
            Manager.ftp(row);

        }else{
            statics.criticalInternalError(err, "Manager->renaming of the normal file failed");
        }
    });
}

Manager.ftp = function(upload_row){

    //console.log("Manager->ftp");

    let upload_key = upload_row.upload_key;
    let current_path = "./ftp_normal/"+upload_key+"."+upload_row.type;
    let destination = "./public_html/normal/"+upload_key+"."+upload_row.type;;

    if(upload_row.encrypt){
        destination = "./public_html/encrypted/"+upload_key+"."+upload_row.type;
        current_path = "./ftp_encrypted/"+upload_key+"."+upload_row.type;
    }

    sendViaFTP(current_path, destination).then(()=>{

        fs.unlink(current_path, (err1)=>{

            if(!err1){

                Database.setFinishedStatus(upload_key, (err2, result)=>{

                    if(err2){

                        statics.criticalInternalError(err2, "Manager->setting the finish status failed");
                    }
                })

                Manager.check();

            }else{

                statics.criticalInternalError(err1, "Manager->deleting temp file failed");
            }
            
        });

    }).catch((err)=>{

        statics.criticalInternalError(err, "Manager->sendViaFTP failed");
    });

}

Manager.uploadExpire = function(){

    setInterval(()=>{

        fs.readdir(env.FTP_NRM_PATH, (err, files) => {

            if(!err){

                files.forEach((fn)=>{

                    let name = fn.split(".")[0];

                    Database.getUploadByUploadKey(name, (err1, result1)=>{

                        if(!err1 && result1[0]){

                            if((Date.now() - result1[0].updated_at) > env.UPLOAD_EXPIRE_TIME){

                                //delete the row and the file
                                fs.unlink(env.FTP_NRM_PATH + fn, (err2)=>{

                                    if(!err2){

                                        Database.deletRowByUploadKey(name, (err3, result3)=>{
                                            
                                            if(err3){

                                                statics.criticalInternalError(err, "Manager->uploadExpire->deleting the upload obj from db failed");
                                            }
                                        });
    
                                    }else{
    
                                        statics.criticalInternalError(err2, "Manager->uploadExpire-> deleting the temp file failed");
                                    }
                                });
                            }

                        }else{

                            statics.criticalInternalError(err, "Manager->uploadExpire-> getting upload obj failed");
                        }
                    });
                });
    
            }else{

                statics.criticalInternalError(err, "Manager->uploadExpire-> reading FTP_NRM_PATH dir failed");
            }
        });


    }, MANAGER_UPLOAD_EXPIRE_INTERVAL);
}

Manager.hibernate = function(){

    Manager.status = "hibernate";

    //console.log("Manager->hibernate");

    clearTimeout(Manager.timeout);

    Manager.timeout = setTimeout(()=>{

       Manager.check();
        
    },5000);
}



module.exports = Manager;