const mysql = require('mysql');


/**
 * @typedef {mysql.Connection} Connection
 * 
 * @type {{
 * connection:Connection,
 * init:()=>{},
 * createTable:()=>{},
 * drop:()=>{},
 * saveUploadInfo:(data, cb)=>{},
 * getUploadsRow:(data, cb)=>{},
 * getUploadById:(id, cb)=>{},
 * getUploadByUploadKey:(upload_key, cb)=>{},
 * setUploadEncKey:(upload_key, enc_key, cb)=>{},
 * setUploadedStatus:(id, size_enc, cb)=>{},
 * setUploadEncrypt:(upload_key, encrypt, cb)=>{},
 * setFinishedStatus:(id, cb)=>{},
 * deletRowByUploadKey:(upload_key, cb)=>{}
 * }}
 */
const Database = {};

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

Database.init = function(){

    Database.connection.query("CREATE DATABASE convertor", function (err, result) {
        
        if (!err) console.log("Database created");

        Database.createTable();
        
    });
}

Database.createTable = function(){

    let sql = "CREATE TABLE uploads (id INT AUTO_INCREMENT PRIMARY KEY, upload_key VARCHAR(64), "+
    "size BIGINT, type VARCHAR(16), encrypt BOOLEAN, status VARCHAR(16), size_enc BIGINT, "+ 
    "public BOOLEAN, enc_key VARCHAR(16), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "+
    "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)";
        
        Database.connection.query(sql, function (err, result) {
            
            if (!err){
                console.log("Table created");
            }else{
                console.log(err);
            }
        });
}

Database.drop = function(){

    let sql = "DROP TABLE uploads";

    Database.connection.query(sql, function (err, result) {
            
        if (!err) console.log("Table droped!");
    });
}


Database.saveUploadInfo = function(data, cb){

    let {

        upload_key,
        size,
        type,
        encrypt,

    } = data;

    let qr = `INSERT INTO uploads (upload_key, size, type, encrypt) VALUES ('${upload_key}', '${size}', '${type}', ${encrypt})`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.getUploadsRow = function(data, cb){

    let {

        id,
        upload_key,

    } = data;

    let qr = `SELECT * FROM uploads WHERE id = ${id} AND upload_key = '${upload_key}'`;

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

Database.getUploadByUploadKey = function(upload_key, cb){

    let qr = `SELECT * FROM uploads WHERE upload_key = '${upload_key}'`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.setUploadEncKey = function(upload_key, enc_key, cb){
    
    let qr = `UPDATE uploads SET enc_key = '${enc_key}' WHERE upload_key = '${upload_key}'`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.setUploadedStatus = function(id, size_enc, cb){

    let qr = `UPDATE uploads SET status = 'uploaded', updated_at = ${Date.now()} WHERE id = ${id}`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.setUploadEncrypt = function(upload_key, encrypt, cb){
    
    let qr = `UPDATE uploads SET encrypt = ${encrypt}, updated_at = ${new Date().toISOString()} WHERE upload_key = ${upload_key}`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.setFinishedStatus = function(upload_key, cb){

    let qr = `UPDATE uploads SET status = 'finished', updated_at = '${new Date().toISOString()}' WHERE upload_key = '${upload_key}'`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

Database.deletRowByUploadKey = function(upload_key, cb){

    let qr = `DELETE FROM uploads WHERE upload_key = '${upload_key}'`;

    Database.connection.query(qr, function (err, result) {
        
        cb(err, result);
        
    });
}

module.exports = Database;

