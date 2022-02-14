"use strict";

var log4js = require('log4js');
var logger = log4js.getLogger();
var request = require('request');


 
module.exports = {

    metadata: function metadata() {
        return {
            "name": "GetSpecialist",
            "properties": {            
                "specialityAPI": {"type": "string", "required": true},
                "speciality": {"type": "string", "required": true}              
             },
             "supportedActions": ["valid", "invalid"]
        };
    },

    invoke: (conversation, done) => {
      var specialityAPI = conversation.properties().specialityAPI;
      var speciality = conversation.properties().speciality;
      if(specialityAPI == "undefine" || specialityAPI == "null" || specialityAPI == "" || !specialityAPI.trim()){
        conversation.variable("errorMessage","Error: specialityAPI should not be empty");
        conversation.transition("invalid");
        done();
      }else{
        var options = { method: 'GET',
        url: specialityAPI + speciality,
        headers: 
         { 'Postman-Token': '9978571c-1bb3-4a7a-8c21-8516c9440087',
           'cache-control': 'no-cache' } 
          };

          request(options, function (error, response, body) {
            if (error) throw new Error(error);
            if(response.statusCode == 200){
              body = JSON.parse(body);
              console.log(body.items);
              if(body.items.length < 1 || body.items == undefined){
                conversation.variable("errorMessage","No locations found!");
                conversation.transition("invalid");
                done();
              }else{
                var bodyOfResult = body.items;
                var itemresult = "Here are all the specialists near you:\n";
                for(var i = 0 ;i< bodyOfResult.length;i++){
                  itemresult =itemresult+" \n\n" + bodyOfResult[i].name + ": " + bodyOfResult[i].website;
                }
                conversation.variable("specialityList",itemresult);
                conversation.transition("valid");
              }
            }else{
              conversation.variable("errorMessage","Error: API failure");
              conversation.transition("invalid");
            }
            done();
          });
        } 
    }
}


