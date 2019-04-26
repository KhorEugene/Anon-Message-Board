/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const handler = require('./handler.js');
const ObjectId = require('mongodb').ObjectID
const MongoClient = require('mongodb').MongoClient;
const CONNECTION_STRING=process.env.DB;


module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .get(function(req,res){
      const param = req.params;
      MongoClient.connect(CONNECTION_STRING,function(err,db){
        handler.error(err);
        console.log('Successfully connected to database');
        const dbc = db.db('test').collection(param.board);
        handler.retrieve10(db,dbc,res,param);
      })
    })
    .post(function(req,res){
      const param = req.params;
      const form = req.body;
      const date = new Date();
      const object = {text:form.text,created_on:date,bumped_on:date,reported:false,delete_password:form.delete_password,replies:[],replycount:0}
      MongoClient.connect(CONNECTION_STRING,function(err,db){
        handler.error(err);
        console.log('Successfully connected to database');
        const dbc = db.db('test').collection(param.board);
        handler.insert(db,dbc,object,res,param);
      })
    })
    .put(function(req,res){
      const param = req.params;
      const form = req.body;
      MongoClient.connect(CONNECTION_STRING,function(err,db){
        handler.error(err);
        console.log('Successfully connected to database');
        const dbc = db.db('test').collection(param.board);
        handler.reportthread(db,dbc,form,res,param);
      })
    })
    .delete(function(req,res){
      const param = req.params;
      const form = req.body;
      MongoClient.connect(CONNECTION_STRING,function(err,db){
        handler.error(err);
        console.log('Successfully connected to database');
        const dbc = db.db('test').collection(param.board);
        handler.removethread(db,dbc,form,res,param);
      })
    });
    
  app.route('/api/replies/:board')
    .get(function(req,res){
      const query = req.query;
      const param = req.params;
      MongoClient.connect(CONNECTION_STRING,function(err,db){
        handler.error(err);
        console.log('Successfully connected to database');
        const dbc = db.db('test').collection(param.board);
        handler.retrieveone(db,dbc,query,res,param);
      })
    })
    .post(function(req,res){
      const param = req.params;
      const form = req.body;
      const date = new Date();
      MongoClient.connect(CONNECTION_STRING,function(err,db){
        handler.error(err);
        console.log('Successfully connected to database');
        const dbc = db.db('test').collection(param.board);
        handler.findandupdate(db,dbc,form,date,res,param);
      });
    })
    .put(function(req,res){
      const param = req.params;
      const form = req.body;
      MongoClient.connect(CONNECTION_STRING,function(err,db){
        handler.error(err);
        console.log('Successfully connected to database');
        const dbc = db.db('test').collection(param.board);
        handler.reportreply(db,dbc,form,res,param);
      })  
    })
    .delete(function(req,res){
      const param = req.params;
      const form = req.body;
      MongoClient.connect(CONNECTION_STRING,function(err,db){
        handler.error(err);
        console.log('Successfully connected to database');
        const dbc = db.db('test').collection(param.board);
        handler.deletereply(db,dbc,form,res,param);
      });
    })
  
};
