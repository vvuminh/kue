
var kue = require('kue');
var express = require("express");
var app = express();
var server = require("http").createServer(app);
const ax = require('axios')
server.listen(3000);

let queue = kue.createQueue({
  redis: {
    host: "127.0.0.1",
    port: 6379
  }
});

app.get("/", (req, res) => {
  for (let i = 1; i <= 50; i++) {
    queue
      .create("queue example", {
        title: "This testing request",
        data: i
      })
      .priority("low")
      .delay(50*1000)
      .save();
  }
  for (let i = 1; i <= 10; i++) {
    queue
      .create('test', {
        title: 'this test priprity',
        data: i
      })
      .priority("critical")
      .ttl(20* 1000)
      .attempts(10)
      .save()
  }
  res.send("Hello World!");
});
queue.process("queue example", 1, (job, done) => {
  ax
    .get("https://jsonplaceholder.typicode.com/todos/" + job.data.data)
    .then(result => {
      console.log(result.data);
      done();
      return result.data;
    })
    .catch(error => done(error));
});

queue.process("test", (job, done) => {
  ax
  .get("https://jsonplaceholder.typicode.com/todosm/" + job.data.data)
  .then(result => {
    console.log(result.data);
    done();
    return result.data;
  })
  .catch(error => done(error));
});

app.use('/kue-api/', kue.app);

