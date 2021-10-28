const { default: axios } = require("axios");

/**@param {import("express").Request} req*/
function uploadKeyCheck(req, res, cb){


    let b = req.body;

    let p = {
        token: b.token,
        upload_key: b.upload_key,
        file_type: b.file_type,
        upload_type: b.upload_type, //(exp. educator_avatar)
        course_id: b.course_id, //(nullable)
    }

    console.log(p);
    console.log(b.tenant);
    axios.post("http://tootifa.ir/api/tenant/user/upload/verify", p, {headers:{

        "X-TENANT":b.tenant

    }}).then(res2=>{

        cb(null, res2);

    }).catch(e=>{

        cb(e, null);

    });

}

module.exports = {
    uploadKeyCheck,
}