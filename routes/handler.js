//const MongoClient = require('mongodb').MongoClient;
//const CONNECTION_STRING=process.env.DB;
const ObjectId = require('mongodb').ObjectID


const close = function(db){
  setTimeout(function(){
             db.close(function(err){
    error(err);
    console.log('Successfully closed connection');
  }) 
},1000)
}

const error = function(err){
  if(err){
    console.log(err);
  }
}

const insert = function (db,dbc,obj,res,param) {
  dbc.insertOne(obj,function(err,data){
    error(err);
    console.log('Successfully inserted new document with id '+obj._id)
  })
  res.redirect('/b/'+param.board);
  close(db);
}

const findandupdate = function(db,dbc,form,date,res,param){
  const object = {_id:ObjectId(),text:form.text,created_on:date,delete_password:form.delete_password,reported:false};
  if(form.thread_id.length!=24){
        res.send('Please insert valid thread id');
        return console.log('Invalid thread id');
      } else {
  dbc.findOneAndUpdate({_id:ObjectId(form.thread_id)},{
          $push:{replies:object},
          $set:{bumped_on:date},
          $inc:{replycount:1}
        },{
          returnOriginal:false
        },function(err,data){
          error(err);
          if(data.value==null){
            console.log('Unable to find thread id '+ form.thread_id);
            res.send('Unable to find thread id '+ form.thread_id +' in board '+param.board);
          } else {
            console.log('Successfully added reply to thread id '+ form.thread_id);
            res.redirect('/b/'+param.board+'/'+form.thread_id);
          }
        })
  }
  close(db);
}

const retrieve10 = function(db,dbc,res,param){
  dbc.find({},{reported:0,delete_password:0}).sort({bumped_on:-1}).limit(10).toArray(function(err,data){
          error(err);
          if(data.length==0){
            res.send(param.board+' does not exist'); 
            console.log(param.board+ ' does not exist');
          } else {
          console.log('Successfully found collection documents');
          let result = [];
          data.forEach(function(val){
            let float =[];
            val.replies.slice(0,3).forEach(function(val1){
              if(val1=='[deleted]'){
                float.push(val1);
              } else {
                float.push({_id:val1._id,text:val1.text,created_on:val1.created_on});
              }
            })
            result.push({_id:val._id,text:val.text,created_on:val.created_on,bumped_on:val.bumped_on,replies:float,replycount:val.replycount})
          })
          res.send(result);
          console.log('Successfully retrieved and formatted documents');
          }
  })
  close(db);
}

const retrieveone = function(db,dbc,query,res,param){
  if(query.thread_id.length!=24){
        res.send('Please insert valid thread id');
        return console.log('Invalid thread id');
  } else {
  dbc.findOne({_id:ObjectId(query.thread_id)},{reported:0,delete_password:0},function(err,data){
          error(err);
          if(data==null){
            console.log('Unable to find document id in board '+param.board)
            res.send('Unable to find document id in board '+param.board);
          } else {
            console.log('Successfully found document');
            let float = [];
            data.replies.forEach(function(val){
              if(val=='[deleted]'){
                float.push(val);
              } else {
                float.push({_id:val._id,text:val.text,created_on:val.created_on});
              }
            })
            const result = {_id:data._id,text:data.text,created_on:data.created_on,bumped_on:data.bumped_on,replies:float,replycount:data.replycount};
            res.send(result);
        }
      })
 }
close(db);
}

const removethread = function(db,dbc,form,res,param){
  if(form.thread_id.length!=24){
        res.send('Please insert valid thread id');
        return console.log('Invalid thread id');
      } else {
        dbc.findOne({_id:ObjectId(form.thread_id)},function(err,result){
          error(err);
          if(result==null){
            console.log('No document with given id in board '+param.board)
            res.send('No thread found with given thread id in board '+param.board)
          } else {
            if(result.delete_password!=form.delete_password){
              console.log('Incorrect password');
              res.send('Incorrect password');
            } else {
              dbc.remove({_id:ObjectId(form.thread_id)},{
                justOne:true
              },function(err,data){
                error(err);
                console.log('Document with id '+form.thread_id+' deleted successfully')
                res.send('Success')
              })
            }
          }
        })
  }
  close(db);
}

const deletereply = function(db,dbc,form,res,param){
  if(form.thread_id.length!=24){
          res.send('Please insert valid thread id');
          console.log('Invalid thread id');
        } else if (form.reply_id.length!=24){
          res.send('Please insert valid reply id');
          console.log('Invalid reply id');
        } else {
          dbc.findOne({_id:ObjectId(form.thread_id)},function(err,data){
            error(err);
            if(data==null){
              console.log('Unable to find thread id in board '+param.board)
              res.send('Unable to find thread id in board '+param.board)
            } else {
              let found = false;
              let pass = false;
              let final =[];
              data.replies.forEach(function(val){
                if(val._id==form.reply_id){
                  found = true;
                  if(val.delete_password==form.delete_password){
                    pass=true;
                    final.push('[deleted]');
                  }
                } else {
                    final.push(val);
                }
              })
              if(found&&!pass){
                console.log('Incorrect password')
                res.send('Incorrect password')
              } else if (!found){
                console.log('Reply id does not exist in board '+ param.board);
                res.send('Reply id does not exist in board '+param.board);
              } else {
                dbc.findOneAndUpdate({_id:ObjectId(form.thread_id)},{
                  $set:{replies:final}
                },{
                  returnOriginal:false
                },function(err,result){
                  error(err);
                  console.log('Deleted reply');
                  res.send('Success');
                })
              }
            }
          })
        }  
  close(db)
}

const reportthread = function(db,dbc,form,res,param){
  if(form.thread_id.length!=24){
          res.send('Please insert valid thread id');
          return console.log('Invalid thread id');
        } else {
          dbc.findOneAndUpdate({_id:ObjectId(form.thread_id)},{
            $set:{reported:true}
          },{
            returnOriginal:false
          },function(err,data){
            error(err);
            if(data==null){
              console.log('No document with given id in board '+param.board)
              res.send('No thread found with given thread id in board '+param.board)
            } else {
              console.log('Thread with id '+form.thread_id+' successfully reported')
              res.send('Success')
            }
          })
        }
  close(db);
}

const reportreply = function(db,dbc,form,res,param){
  if(form.thread_id.length!=24){
          res.send('Please insert valid thread id');
          console.log('Invalid thread id');
        } else if (form.reply_id.length!=24){
          res.send('Please insert valid reply id');
          console.log('Invalid reply id');
        } else {
          dbc.findOne({_id:ObjectId(form.thread_id)},function(err,data){
            error(err);
            if(data==null){
              console.log('No thread with id '+form.thread_id+' found in board '+param.board);
              res.send('No thread with id '+form.thread_id+' found in board '+param.board);
            } else {
              let found = false;
              let final = [];
              data.replies.forEach(function(val){
                if(form.reply_id==val._id){
                  found=true;
                  final.push({_id:val._id,text:val.text,created_on:val.created_on,delete_password:val.delete_password,reported:true});
                } else {
                  final.push(val)
                }
              }) 
              if(found){
                dbc.findOneAndUpdate({_id:ObjectId(form.thread_id)},{
                  $set:{replies:final}
                },function(err,result){
                  error(err);
                  console.log('Successfully reported reply id '+form.reply_id);
                  res.send('Success')
                })
              } else {
                console.log('Reply id '+form.reply_id+' not found');
                res.send('Reply id '+form.reply_id+' not found');
              }
            }
          })
        }  
  close(db)
}

module.exports = {
  close,
  error,
  insert,
  findandupdate,
  retrieve10,
  retrieveone,
  removethread,
  deletereply,
  reportthread,
  reportreply
};
