'use strict';

const mongoose = require('mongoose');
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }) 
  .then(() => {
    console.log("MongoDB connected")
  }) 
  .catch((err) => console.log(err));

const threadSchema = new mongoose.Schema({
  board: String,
  text: String,
  created_on: Date,
  bumped_on: Date,
  reported: Boolean,
  delete_password: String,
  replies: Array
})

const replySchema = new mongoose.Schema({
  text: String,
  created_on: Date,
  delete_password: String,
  reported: Boolean
})

const Thread = new mongoose.model("Thread", threadSchema)
const Reply = new mongoose.model("Reply", replySchema)


module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .post((req, res) => {
      //save new Thread
      let dateCreate = new Date()
      const newThread = new Thread({
        board: req.body.board,
        text: req.body.text,
        created_on: dateCreate,
        bumped_on: dateCreate,
        reported: false,
        delete_password: req.body.delete_password,
        replies: []
      })
      newThread.save()
    })
    .get((req, res) => {
       //get 10 threads 3 reply per thread
      Thread.find({board: req.params.board}).sort({bumped_on: -1}).limit(10).select({reported: 0, delete_password: 0, __v: 0}).slice("replies", 3).exec((err, doc) => {
        if (err) {
          return console.log(err)
        }
        return res.json(doc)
      })
    })
    .delete((req, res) => {
      Thread.findById({_id: req.body.thread_id}, (err, doc) => {
        if (err) {
          return console.log(err)
        }
        if (doc.delete_password == req.body.delete_password) {
          doc.remove()
          return res.json("success")
        }
        return res.json("incorrect password")
      })
    })
    .put((req, res) => {
      Thread.findByIdAndUpdate(req.body.thread_id, {reported: true}, {new: true}, (err, doc) => {
        if (err) {
          return console.log(err)
        }
        return res.json("success")
      })
    })


  app.route('/api/replies/:board')
    .post((req, res) => {
      //new reply, update bumped_on
      Thread.findByIdAndUpdate(req.body.thread_id, {bumped_on: new Date()}, {new: true}, (err, doc) => {
        if (err) {
          return console.log(err)
        }
        //change replies array
        let previousReplies = doc.replies
        let newReply = new Reply({
          text: req.body.text,
          created_on: new Date(),
          delete_password: req.body.delete_password,
          reported: false
        })
        Thread.findByIdAndUpdate(req.body.thread_id, {replies: [newReply, ...previousReplies]}, {new: true}, (err, doc) => {
          if (err) {
            return console.log(err)
          }
        })
      })
    })
    .get((req, res) => {
      Thread.findById(req.query.thread_id).select({reported: 0, delete_password: 0, __v: 0}).exec((err, doc) => {
        if (err) {
          return console.log(err)
        }
        res.json(doc)
      })
    })
    .delete((req, res) => {
      Thread.findOne({_id: req.body.thread_id}, (err, doc) => {
        if (err) {
          return console.log(err)
        }
        let index = -1
        doc.replies.forEach((reply) => {
          index = index + 1
          if (reply._id == req.body.reply_id) {
            if (reply.delete_password == req.body.delete_password) {
              let newThread = new Thread(doc)
              newThread.replies[index].text = "[deleted]"
              newThread.save()
              return res.json("success")
            }
            return res.json("incorrect password")
          }
          return res.json("no id match")
        })
      })
    })
    .put((req, res) => {
      Thread.findOne({_id: req.body.thread_id}, (err, doc) => {
        if (err) {
          return console.log(err)
        }
        let index = -1
        doc.replies.forEach((reply) => {
          index = index + 1
          if (reply._id == req.body.reply_id) {
            let newThread = new Thread(doc)
            newThread.replies[index].reported = true
            newThread.save()
            return res.json("success")
          }
        })
      })
    })

};
