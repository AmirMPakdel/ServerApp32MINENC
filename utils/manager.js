const fs = require("fs");
const env = require("../env");
const statics = require("../statics");
const Database = require("./database");
const { sendViaFTP } = require("./downloadhost");
const encryptor = require("./encryptor");

class Manager {

    constructor(config){

        if (!fs.existsSync("./uploads")){
            fs.mkdirSync("./uploads");
        }
        if (!fs.existsSync(env.TEMP_STAGE_DIR)){
            fs.mkdirSync(env.TEMP_STAGE_DIR);
        }
        if (!fs.existsSync(env.LOBBY_STAGE_DIR)){
            fs.mkdirSync(env.LOBBY_STAGE_DIR);
        }
        if (!fs.existsSync(env.VERIFIED_STAGE_DIR)){
            fs.mkdirSync(env.VERIFIED_STAGE_DIR);
        }

        this.MANAGER_CHECK_INTERVAL = config.MANAGER_CHECK_INTERVAL;
        this.UPLOAD_EXPIRE_TIME = config.UPLOAD_EXPIRE_TIME;
        this.MANAGER_UPLOAD_EXPIRE_INTERVAL = config.MANAGER_UPLOAD_EXPIRE_INTERVAL;
        this.FTP_DISABLED_TEST_MODE = config.FTP_DISABLED_TEST_MODE;

        this.status = "hibernate";

        /**@type {NodeJs.Timeout} */
        this.timeout = null;
    }

    init = ()=>{

        this.check();
        this.uploadExpire();
    }

    check = ()=>{
    
        fs.readdir(env.VERIFIED_STAGE_DIR, (err, files) => {
    
            if(!err){
    
                if(files.length){
    
                    this.handle(files[0]);
    
                }else{

                    this.hibernate();
                }
    
            }else{
    
                statics.criticalInternalError(err, "reading the VERIFIED_STAGE_DIR dir failed");
            }
        });
    }

    /**
     * @param {String} file_name 
     */
    handle = (file_name)=>{

        this.status = "working";

        let upload_key = file_name;
        
        Database.getUploadByUploadKey(upload_key, (err, result)=>{

            if(!err){

                let row = result[0];

                if(row){

                    if(row.encrypt){

                        this.encrypt(row);

                    }else{
                        
                        this.ftp(row);
                    }

                }else{

                    statics.criticalInternalError("", "Manager->file_name not match any upload key in db");

                }

            }else{

                statics.criticalInternalError(err, "Manager->db error");
            }

        });
    }

    encrypt = (upload_row)=>{

        encryptor(upload_row.enc_key, upload_row.upload_key, (output_path)=>{

            this.ftp(upload_row);
        });
    }
    
    ftp = (upload_row)=>{

        let upload_key = upload_row.upload_key;
        let current_path = env.VERIFIED_STAGE_DIR + upload_key;
        let distination_dir = "./public_html/course_media/"+upload_row.tenant+"/";
        let file_name = upload_key+"."+upload_row.type;

        if(upload_row.public){
            distination_dir = "./public_html/public_files/"+upload_row.tenant+"/";
        }

        // set FTP_DISABLED_TEST_MODE to true if you don't have access to ftp server
        if(!this.FTP_DISABLED_TEST_MODE){

            sendViaFTP(current_path, distination_dir, file_name, upload_row.free).then(()=>{

                fs.unlink(current_path, (err1)=>{
    
                    if(!err1){
    
                        Database.setFinishedStatus(upload_key, (err2, result)=>{
    
                            if(err2){
    
                                statics.criticalInternalError(err2, "Manager->setting the finish status failed");
                            }
                        });
    
                        this.check();
    
                    }else{
    
                        statics.criticalInternalError(err1, "Manager->deleting temp file failed");
                    }
                    
                });
    
            }).catch((err)=>{
    
                statics.criticalInternalError(err, "Manager->sendViaFTP failed");
            });

        }else{

            console.log("FTP_DISABLED_TEST_MODE->consider the file has been sent via ftp");
            console.log("ftp destination : "+distination_dir);

            fs.unlink(current_path, (err1)=>{
    
                if(!err1){

                    Database.setFinishedStatus(upload_key, (err2, result)=>{

                        if(err2){

                            statics.criticalInternalError(err2, "Manager->setting the finish status failed");
                        }
                    });

                    this.check();

                }else{

                    statics.criticalInternalError(err1, "Manager->deleting temp file failed");
                }
                
            });
        }
    }

    uploadExpire = ()=>{

        setInterval(()=>{

            fs.readdir(env.UPLOAD_READY_PATH, (err, files) => {

                if(!err){

                    files.forEach((fn)=>{

                        let name = fn;

                        Database.getUploadByUploadKey(name, (err1, result1)=>{

                            if(!err1 && result1[0]){

                                
                                if((Date.now() - new Date(result1[0].updated_at).getTime()) > this.UPLOAD_EXPIRE_TIME){

                                    //delete the row and the file
                                    fs.unlink(env.LOBBY_STAGE_DIR + fn, (err2)=>{

                                        if(!err2){

                                            Database.deletRowByUploadKey(name, (err3, result3)=>{
                                                
                                                if(err3){

                                                    statics.criticalInternalError(err, "Manager->uploadExpire->deleting the upload obj from db failed");
                                                
                                                }else{

                                                    console.log("uploadExpire-> file has been deleted ->"+fn);
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


        }, this.MANAGER_UPLOAD_EXPIRE_INTERVAL);
    }

    hibernate = ()=>{

        this.status = "hibernate";

        clearTimeout(this.timeout);

        this.timeout = setTimeout(()=>{

            this.check();
            
        }, this.MANAGER_CHECK_INTERVAL);
    }
}

module.exports = Manager;