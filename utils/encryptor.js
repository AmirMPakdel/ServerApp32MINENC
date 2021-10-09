const fs = require("fs");
const crypto = require("crypto");

function injectId (id, input_path, output_path, cb){

    //let id = uuidv4();
    //console.log(id);

    let zTemp = "";
    let temp = id;
    
    for(let i=0; i<16; i++){
        zTemp+="####";
    }
    
    for(let i=0; i<4078; i++){
        temp+="##";
    }

    let input_file = fs.createReadStream(input_path);

    let output_file = fs.createWriteStream(output_path);

    input_file.on("end", ()=>{
        input_file.close();
        console.log("input_file on end");
    });

    input_file.on("close", ()=>{
        console.log("input_file on close");
    });

    output_file.on("finish", ()=>{
        output_file.close();
        console.log("output_file on finish");
    });

    output_file.on("close", ()=>{
        
        console.log("output_file on close");

        // deleting the nii file
        fs.unlink(input_path, cb)
    });
    
    output_file.write(temp, (err)=>{
    
        if(err){
            console.log("output_file.write->"+err);
        }else{
            input_file.pipe(output_file);
        }
    });
}

// injectId("./react-native coding.enc.mp4", "./react-native coding.enc_with_id.mp4", ()=>{
//     console.log("done!");
// });

function encrypt_file(input_path, output_path, cb) {

    let algo = "aes-128-cbc";
    let key = "fT6GI9OnH8G9klNd";
    let iv = "ni85Gnj8LdOi92Fn";
    let cipher = crypto.createCipheriv(algo, key, iv);
    let input = fs.createReadStream(input_path, {highWaterMark:8192});
    let output = fs.createWriteStream(output_path, {highWaterMark:8192});

    input.pipe(cipher).pipe(output);

    output.on('finish', ()=> {

        fs.unlink(input_path, ()=>{

            cb(null, output_path);
        });
    });

    output.on("error", (err)=>{

        console.log(err);

        fs.unlink(input_path, ()=>{

            cb(err, null);
        });
    });
}

function encryptor(id, file_name, file_type, cb){

    id = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";

    //nii -> need id inject
    encrypt_file("./ftp_normal/"+file_name+"."+file_type, "./ftp_encrypted/"+file_name+".nii", (err)=>{

        if(!err){
            
            injectId(id, "./ftp_encrypted/"+file_name+".nii", "./ftp_encrypted/"+file_name+"."+file_type, ()=>{

                cb("./ftp_encrypted/"+file_name+"."+file_type);
            });

        }else{

            //TODO: handle encrypt error
        }
    });
}

// encrypt_file("./react-native coding.mp4", "./react-native coding.enc.mp4", ()=>{
//     console.log("done!");
// })

module.exports = encryptor;