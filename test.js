const { default: axios } = require("axios");
const Manager = require("./utils/manager");

//Manager.check();

let qs = require('qs');
const Database = require("./utils/database");

function upload_check(){

    let data = qs.stringify({
        'user_token': '123',
        'temp_key': 'j45j3j45' 
    });
    let config = {
        method: 'post',
        url: 'http://localhost:8020/upload_check',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : data
    };
    
    axios(config)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
        console.log(error);
    });
}

function upload_progress(){

    var FormData = require('form-data');
    var fs = require('fs');
    var data = new FormData();
    data.append('mfile', fs.createReadStream('./test.mp4'));
    data.append('upload_id', '1');
    data.append('temp_key', 'j45j3j45');

    var config = {
    method: 'post',
    url: 'http://localhost:8020/upload_progress',
    headers: { 
        ...data.getHeaders()
    },
    data : data
    };

    axios(config)
    .then(function (response) {
    console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
    console.log(error);
    });

} 

function moveToFtp(){

    var data = qs.stringify({
        'temp_key': 'j45j3j45' 
      });
      var config = {
        method: 'post',
        url: 'http://localhost:8020/moveToFtp',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : data
      };
      
      axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
}


// Database.drop(()=>{
//   Database.createTable();
// });


function say_good_morning(params) {

  return new Promise((resolve, reject)=>{


    setTimeout(()=>{

      if(params.day){

        resolve("good day #"+params.num);

      }else{

        reject({error:"in day"+params.num+" there is no sunshine", message:"fuck #"+params.num});
      }

    }, 50, params);

  });
}

let arra = [
  {day:true, num:1},
  {day:false, num:2},
  {day:false, num:3},
  {day:true, num:4},
]

let pr_arr = [];
arra.forEach((e)=>{

  pr_arr.push(say_good_morning(e).catch(error=>error));
  
});


let errors = [];
let results = [];

Promise.all(pr_arr).then((result1)=>{

  console.log(result1);

});