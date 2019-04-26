/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

const board = 'board1';
const thread = 'thread1';
const testthreadid = '5cc2e11ebee0160b23b29e81';
const tpassword = 'password1';
const reply = 'reply1';
const rpassword = 'password2';
let tid;
let rid;

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    test('Creating a new thread with POST to /api/threads/board1',function(done){
      suite('POST', function() {
        chai.request(server)
        .post('/api/threads/board1')
        .send({text:thread,delete_password:tpassword})
        .end(function(err,res){
          assert.equal(res.status,200);
          done();
        })
      });
    });
    
    test('Getting 10 most recently bumped threads with GET to /api/threads/board1',function(done){
      suite('GET', function() {
        chai.request(server)
        .get('/api/threads/board1')
        .end(function(err,res){
          assert.equal(res.status,200);
          assert.isArray(res.body);
          assert.isAtMost(res.body.length,10);
          assert.equal(res.body[0].replies.length,0);
          assert.property(res.body[0],'_id');
          assert.property(res.body[0],'text');
          assert.property(res.body[0],'created_on');
          assert.property(res.body[0],'bumped_on');
          assert.equal(res.body[0].created_on,res.body[0].bumped_on);
          assert.notProperty(res.body,'reported');
          assert.notProperty(res.body,'delete_password')
          tid = res.body[0]._id;
          done();
        })
      });
    })
    
    test('Reporting a thread with PUT to /api/threads/board1',function(done){
      suite('PUT', function() {
        chai.request(server)
        .put('/api/threads/board1')
        .send({thread_id:tid})
        .end(function(err,res){
          assert.equal(res.status,200);
          assert.equal(res.text,'Success');
          done();
        })
        
      });
    });
    
    test('Deleting a thread (incorrect password) with DELETE to /api/threads/board1',function(done){
      suite('DELETE', function() {
        chai.request(server)
        .delete('/api/threads/board1')
        .send({thread_id:tid,delete_password:'aaaaaaaaaaaaaaaaaaaaaaaa'})
        .end(function(err,res){
          assert.equal(res.status,200);
          assert.equal(res.text,'Incorrect password');
          done();
        })
      });
    });
    
    test('Deleting a thread (correct password) with DELETE to /api/threads/board1',function(done){
      suite('DELETE', function() {
        chai.request(server)
        .delete('/api/threads/board1')
        .send({thread_id:tid,delete_password:tpassword})
        .end(function(err,res){
          assert.equal(res.status,200);
          assert.equal(res.text,'Success');
          done();
        })
      });
    });
  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    
    test('Creating a new reply to test thread with POST to /api/replies/board1',function(done){
      suite('POST', function() {
        chai.request(server)
        .post('/api/replies/board1')
        .send({text:reply,delete_password:rpassword,thread_id:testthreadid})
        .end(function(err,res){
          assert.equal(res.status,200);
          done();
        })
      });
    });
    
    test('Getting an entire thread with all replies with GET to /api/replies/board1',function(done){
      suite('GET', function() {
        chai.request(server)
        .get('/api/replies/board1?thread_id='+testthreadid)
        .end(function(err,res){
          assert.equal(res.status,200);
          assert.isArray(res.body.replies);
          assert.property(res.body,'_id');
          assert.property(res.body,'text');
          assert.property(res.body,'created_on');
          assert.property(res.body,'bumped_on');
          assert.notProperty(res.body,'reported');
          assert.notProperty(res.body,'delete_password')
          rid = res.body.replies[res.body.replycount-1]._id;
          done();
        })
      });
    })
    
   test('Reporting a reply with PUT to /api/replies/board1',function(done){
      suite('PUT', function() {
        chai.request(server)
        .put('/api/replies/board1')
        .send({thread_id:testthreadid,reply_id:rid})
        .end(function(err,res){
          assert.equal(res.status,200);
          assert.equal(res.text,'Success');
          done();
        })
        
      });
    });
    
   test('Deleting a reply (incorrect password) with DELETE to /api/replies/board1',function(done){
      suite('DELETE', function() {
        chai.request(server)
        .delete('/api/replies/board1')
        .send({thread_id:testthreadid,reply_id:rid,delete_password:'aaaaaaaaaaaaaaaaaaaaaaaa'})
        .end(function(err,res){
          assert.equal(res.status,200);
          assert.equal(res.text,'Incorrect password');
          done();
        })
      });
    });
    
    test('Deleting a reply (correct password) with DELETE to /api/replies/board1',function(done){
      suite('DELETE', function() {
        chai.request(server)
        .delete('/api/replies/board1')
        .send({thread_id:testthreadid,reply_id:rid,delete_password:rpassword})
        .end(function(err,res){
          assert.equal(res.status,200);
          assert.equal(res.text,'Success');
          done();
        })
      });
    });
    
  });

});
