"use strict";

var log4js = require('log4js');
var logger = log4js.getLogger();
var request = require('request');


 
module.exports = {

    metadata: function metadata() {
        return {
            "name": "WhatsOpen",
            "properties": {            
                "hoursAPI": {"type": "string", "required": true},
                "dayOfWeek": {"type": "string", "required": true}              
             },
             "supportedActions": ["valid", "invalid", "empty"]
        };
    },

    invoke: (conversation, done) => {
      var hoursAPI = conversation.properties().hoursAPI;
      var dayOfWeek = conversation.properties().dayOfWeek;
      if(hoursAPI == "undefine" || hoursAPI == "null" || hoursAPI == "" || !hoursAPI.trim()){
        conversation.variable("errorMessage","Error: hoursAPI should not be empty");
        conversation.transition("invalid");
        done();
      }else{
        var options = { method: 'GET',
        url: hoursAPI + dayOfWeek,
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
                conversation.variable("hoursList","Unfortunately, no locations seem to be open right now! Browse our website to check out other available times.");
                conversation.transition("empty");
                done();
              }else{
                var bodyOfResult = body.items;
                var itemresult = "Here are all the open health centers near you! Some of these locations may require appointments. Check out their websites to reserve a spot:\n";
                for(var i = 0 ;i< bodyOfResult.length;i++){
                  itemresult =itemresult+" \n\n" + bodyOfResult[i].name + ": " + bodyOfResult[i].website + "\n" + dayOfWeek + ": " + bodyOfResult[i].open + " - " + bodyOfResult[i].close;
                }
                conversation.variable("hoursList",itemresult);
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


