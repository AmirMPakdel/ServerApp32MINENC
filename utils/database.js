const mysql = require('mysql');

const Database = {

    /**@type {mysql.Connection}*/
    connection:null,

    saveUploadInfo:(data, cb)=>{},

    getUploadsRow:(data, cb)=>{},

    getUploadById:(id, cb)=>{},

    setUploadedStatus:(id, size_enc, cb)=>{},
}

Database.connection = mysql.createConnection({
    // host: "185.190.39.87",
    // user: "rastinideh",
    // port: 3306,
    // password: "50WhatWeSmockWeed?",
    // database:"convertor"
    host: "localhost",
    user: "root",
    password: "",
    database:"convertor"
});

Database.connection.connect(function(err) {
    if (err) throw err;
    console.log("mysql connected!");
});

Database.saveUploadInfo = function(data, cb){

    let {

        temp_key,
        size,
        type,
        encrypt,

    } = data;

    let qr = `INSERT INTO uploads (temp_key, size, type, encrypt) VALUES ('${temp_key}', '${size}', '${type}', ${encrypt})`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.getUploadsRow = function(data, cb){

    let {

        id,
        temp_key,

    } = data;

    let qr = `SELECT * FROM uploads WHERE id = ${id} AND temp_key = '${temp_key}'`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.getUploadById = function(id, cb){

    let qr = `SELECT * FROM uploads WHERE id = ${id}`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.setUploadedStatus = function(id, size_enc, cb){

    let qr = `UPDATE uploads SET status = 'uploaded' WHERE id = ${id}`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

module.exports = Database;

