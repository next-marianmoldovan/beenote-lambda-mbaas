var AWS = require('aws-sdk');

//AWS.config.region = 'eu-west-1';

/* Example messages

Get notes
{
  "operation": "GET"
}

Delete a note
{
  "operation": "DELETE",
  "message": {"title": "Wall-E"}
}

Create a note
{
  "operation": "POST",
  "message": {"title":"Wall-E", "content": "I don't want to survive... I want to live"}
}

Update a note
{
  "operation": "PUT",
  "message": {"title":"Wall-E", "content": "Eeee... aah"}
}
*/
var dynamodb = new AWS.DynamoDB();

console.log('Loading function');

exports.handler = function(event, context) {
    console.log(typeof(event.message));
    if(event.operation === 'GET')
        get(context);
    else if(event.operation === 'POST')
        post(context, event.message);
    else if(event.operation === 'PUT')
        put(context, event.message);
    else if(event.operation === 'DELETE')
        del(context, event.message);
    else context.fail(new Error('No operation specified'));
};

function get(context){
    dynamodb.scan({TableName: 'beenote'}, function(err, data){
        context.done(err, clean(data));
    });
}

function post(context, message){
    unclean(message);
    var params = {TableName: 'beenote', 'Item' : message, ReturnValues: 'NONE'};
    dynamodb.putItem(params, function(err, data){
        context.done(err, data);
    });
}

function put(context, message){
    unclean(message);
    var params = {TableName: 'beenote', 'Key' : message, ReturnValues: 'ALL_NEW'};
    dynamodb.updateItem(params, function(err, data){
        context.done(err, data);
    });
}

function del(context, message){
    unclean(message);
    delete message.content;
    var params = {TableName: 'beenote', 'Key' : message, 'ReturnValues': 'ALL_OLD'};
    dynamodb.deleteItem(params, function(err, data){
        context.done(err, data);
    });
}

// Just for removing type of objs
function clean(obj){
    var newObj = {'count':obj.Count, 'items':[]};
    obj.Items.forEach(function(item){
        var newItem = {};
        var keys = Object.keys(item);
        keys.forEach(function(key){
            var subKey = Object.keys(item[key]);
            newItem[key] = item[key][subKey[0]];
        });
        newObj.items.push(newItem);
    });
    return newObj;
    
}

// Adding type of objs...damn dynamodb
function unclean(item){
    var keys = Object.keys(item);
    keys.forEach(function(key){
        item[key] = {"S": item[key]};
    });

}