const statics = {

    "SUCCESS":5000,
    "INVALID_TOKEN":5001,
    "INVALID_UPLOAD_KEY":5002,
    "INVALID_TENANT":5003,
    "SIZES_NOT_EQUAL":5003,
    "FILE_NOT_FOUND":5004,
    "RESPONSE_ARRAY":5005,
    "PENDING":5100,
    "UPLOAD_REJECT":5200,
    "SERVER_ERROR":5300,

    sendData,
    sendError,
    sendResponseArray,
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

function sendResponseArray(res, response_array){

    res.json({
        result_code : statics.RESPONSE_ARRAY,
        message:"multiple responses as an array",
        responses:response_array,
    });
}

function criticalInternalError(error, message) {
    
    //TODO: save in a log file later
    console.log("CIE:: \nerror:"+error+"\nmessage:"+message);
}

module.exports = statics;