
//External Modules
const request = require("request");
const mongoClient = require("mongodb").MongoClient;

//Read from a public API. bitcoin price per day
function fetchFromAPI(callback){
    request.get('https://api.coindesk.com/v1/bpi/historical/close.json', (err, raw, body) => {
        return callback(err, JSON.parse(body));
    });
}

//testing API
/*fetchFromAPI((err, data) =>{
    if(err) {
        console.log(err);
        return;
    }
    console.log(data)
})*/

const dsn = 'mongodb://localhost:27017/test'; // maxcoin is the new db that gets created if doesn't exist

function insertData(collection, data) {
    let promiseList = [];
    Object.keys(data).forEach( key => {
        promiseList.push(
            collection.insertOne({date: key, value:data[key]})
        );
    });
     return Promise.all(promiseList);
}

mongoClient.connect(dsn, (err, db) => {
    if(err) throw err;
    console.log("connection Successful");
    fetchFromAPI( (err, data) => {
        const collection = db.collection('value'); //create a new collection name Value
        insertData(collection, data.bpi)
            .then(result => {
                console.log(`Inserted ${result.length} records`);
                db.close();
            }).catch(err => {
                console.log(err);
                process.exit();
            });
    });
       
});

