const statics = {

    "SUCCESS":1000,
    "INVALID_TOKEN":1001,
    "INVALID_UPLOAD_KEY":1002,
    "INVALID_TENANT":1003,
    "SIZES_NOT_EQUAL":1003,
    "FILE_NOT_FOUND":1004,
    "PENDING":2000,
    "UPLOAD_REJECT":3000,
    "SERVER_ERROR":5000,

    sendData,
    sendError,
    criticalInternalError,
}


function sendData(res, data, result_code) {
    
    if(!result_code){result_code = statics.SUCCESS}

    res.json({
        result_code,
        data
    });
}

function sendError(res, error, message, result_code) {

    if(!result_code){result_code = statics.SERVER_ERROR}

    res.json({
        result_code,
        message,
        error
    });
}

function criticalInternalError(error, message) {
    
    //TODO: save in a log file later
    console.log("CIE:: \nerror:"+error+"\nmessage:"+message);
}

module.exports = statics;