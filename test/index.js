const axios = require('axios');
const qs = require('qs');
const FormData = require('form-data');
const fs = require('fs');

const mockServer = require("./mockServer");
const testServer = require("./testServer");
const statics = require('../statics');
const Database = require('../utils/database');


Database.drop(()=>{

    Database.createTable(()=>{

        runServers(()=>{
            
            run();
        });
    });
});

function runServers(cb){

    let response = {
        result_code: statics.mainServerStatics.SUCCESS,
        data: {
          file_type: "mp4",
          file_size: 1428135,
          is_encrypted: 1,
          is_public: 0,
        },
    };

    mockServer.run(response, ()=>{

        testServer.run(()=>{

            cb();
        });
    });
}

function run(){

    let tenant = "convtest";
    let token = "24b9e2d9abc123448f2d5cd56";
    let upload_key = "85484e2d5c1c6473248a846f8f8d8e4-a01-5";
    let file_path = "./test.mp4";
    

    let uploadCheck_config = {
        tenant,
        token,
        upload_key
    }

    uploadCheck(uploadCheck_config, (err1, res1)=>{

        if(!err1 && res1.result_code == 5000){

            let d1 = res1.data;
            let upload_id = d1.upload_id;

            let uploadProgress_config = {
                file_path,
                upload_id,
                upload_key,
                tenant,
            }

            uploadProgress(uploadProgress_config, (err2, res2)=>{

                if(!err2 && res2.result_code == 5000){

                    let moveToFtp_config = {
                        upload_key,
                        enc_key: "jhgu58io98fy47u3",
                        tenant,
                    }

                    moveToFtp(moveToFtp_config, (err3, res3)=>{

                        if(!err3, res3.result_code == 5005){

                            
                            let responses3 = res3.responses;
                            let res3_is_ok = responses3.length?true:false;

                            responses3.forEach((res3_1)=>{
                                if(res3_1.result_code !== 5000){
                                    res3_is_ok = false;
                                }
                            });

                            if(res3_is_ok){
                                console.log("Done!");
                            }
                        }
                    });
                }
            });
        }
    });
};

function uploadCheck(config, cb){

    let data = qs.stringify({
        tenant: config.tenant,
        token: config.token,
        upload_key: config.upload_key,
    });

    let req_config = {
        method: 'post',
        url: 'http://localhost:8020/upload_check',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data
    };

    axios(req_config).then(function (response) {
        console.log("uploadCheck->response->sucess");
        console.log(response.data);
        cb(null, response.data);

    }).catch(function (error) {
        console.log("uploadCheck->response->error");
        console.log(error);
        cb(error, null);
    });
}

function uploadProgress(config, cb){

    let data = new FormData();
    data.append('mfile', fs.createReadStream(config.file_path));
    data.append('upload_id', config.upload_id);
    data.append('upload_key', config.upload_key);
    data.append('tenant', config.tenant);

    let req_config = {
        method: 'post',
        url: 'http://localhost:8020/upload_progress',
        headers: { 
            ...data.getHeaders()
        },
        data
    };

    axios(req_config).then(function (response) {
        console.log("uploadProgress->response->sucess");
        console.log(response.data);
        cb(null, response.data);

    }).catch(function (error) {
        console.log("uploadProgress->response->error");
        console.log(error);
        cb(error, null);
    });
}

function moveToFtp(config, cb){

    let data = qs.stringify({
        'upload_key': config.upload_key,
        'enc_key': config.enc_key,
        'tenant': config.tenant,
    });

    let req_config = {
        method: 'post',
        url: 'http://localhost:8020/moveToFtp',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data
    };

    axios(req_config).then(function (response) {
        console.log("moveToFtp->response->sucess");
        console.log(response.data);
        cb(null, response.data);

    }).catch(function (error) {
        console.log("moveToFtp->response->error");
        console.log(error);
        cb(error, null);
    });
}

/*
const filePath = path.resolve("./test.jpg");
const writer = fs.createWriteStream(filePath);
await axios.get(`${subitems[2].imageURL}`, { responseType: 'stream' })
    .then(async response => {await response.data.pipe(writer);})
    .catch(error => console.log('Erro ao baixar ou salvar imagem: ', error));

fs.readFile(filePath, async (error, data) => {
    if (error) {
        console.log(error);
        return;
    }

    const image = new FormData();
    image.append('image', data, {
        filepath: filePath,
        contentType: 'image/jpg',
    });

    await axios
    .post(
        `http://localhost:1337/api/upload-image/${subitems[2].id}`,
        image,
        {
        headers: image.getHeaders(),
        },
    )
    .then(response => {
        console.log(
        'success! ',
        response.status,
        response.statusText,
        response.headers,
        typeof response.data,
        Object.prototype.toString.apply(response.data),
        );
    })
    .catch(err => {
        console.log(err);
    });
});
*/