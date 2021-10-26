const { default: axios } = require("axios");

function uploadKeyCheck(req, res, cb){


    let p = {
        token,
        upload_key,
        file_type,
        upload_type, //(exp. educator_avatar)
        course_id, //(nullable)
    }

    axios.post("http://tootifa.ir/api/tenant/user/upload/verify", p, {}).then(res2=>{

        cb(null, res2);

    }).catch(e=>{

        cb(e, null);

    });

}

module.exports = {
    uploadKeyCheck,
}