/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
function uploadProgress(req, res){

    if(req.file){
        console.log(req.file);
        res.send('ok')
    }else{
        res.send('not ok')
    }
}

module.exports = uploadProgress;