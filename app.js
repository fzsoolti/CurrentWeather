//init
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");

const geoip = require('geoip-lite');

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//Index
app.get("/",(req,res)=>{
  res.render("home");
});

//get weather from ip
app.get("/location",(req,res)=>{
    var ipLoc = getClientIp(req);
    var geo = geoip.lookup(ipLoc); //get the location from ip with geoip-lite
    if (geo !== null) {
        write(req,res,geo.city);
    } else{
        res.render("error");
    }
})

//get weather from input
app.post("/",(req,res)=>{
    const query = req.body.cityName;
    write(req,res,query);
})


//Get weather and write
function write(req,res,query){
    const apiKey= "91c5b247bce7fa11c2e9cee53cd63521";
    const unit = "metric";
    const url="https://api.openweathermap.org/data/2.5/weather?q="+query+"&appid="+apiKey+"&units="+unit;

    https.get(url,(response)=>{
        console.log(response.statusCode);

        if (response.statusCode == 200) {
            response.on("data", (data)=>{
                const day = date.getDate();
                const weatherData = JSON.parse(data);
                res.render("weather",{date: day, weatherData:weatherData});
            })
        } else{
            res.render("error");
        }
    
    })
}

//get ip
function getClientIp(req) {
    var ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.connection.remoteAddress;
    console.log('IP: ', ip);
    return ip;
}

//start
app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server is running on 3000");
})
