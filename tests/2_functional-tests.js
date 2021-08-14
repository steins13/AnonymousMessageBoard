const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  let id

  test("Creating a new thread", (done) => {
    chai
      .request(server)
      .post("/api/threads/myTest")
      .send({
        text: "myThreadTest",
        delete_password: "delete"
      })
      .end((err, res) => {
        id = res.body._id
        assert.equal(res.status, 200);
        assert.equal(res.body.text, "myThreadTest");
        assert.equal(res.body.delete_password, "delete");
        done()
      })
  })

  test("Viewing the 10 most recent threads with 3 replies each", (done) => {
    chai
      .request(server)
      .get("/api/threads/myTest")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done()
      })
  })
  
  test("Deleting a thread with the incorrect password", (done) => {
    chai
      .request(server)
      .delete("/api/threads/myTest")
      .send({
        thread_id: id,
        delete_password: "notDelete"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body, "incorrect password");
        done()
      })
  })

  test("Deleting a thread with the correct password", (done) => {
    chai
      .request(server)
      .delete("/api/threads/myTest")
      .send({
        thread_id: id,
        delete_password: "delete"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body, "success");
        done()
      })
  })

  test("Reporting a thread", (done) => {
    chai
      .request(server)
      .put("/api/threads/myTest")
      .send({
        thread_id: id
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body, "success");
        done()
      })
  })

  test("Creating a new thread 2", (done) => {
    chai
      .request(server)
      .post("/api/threads/myTest")
      .send({
        text: "myThreadTest",
        delete_password: "delete"
      })
      .end((err, res) => {
        id = res.body._id
        assert.equal(res.status, 200);
        assert.equal(res.body.text, "myThreadTest");
        assert.equal(res.body.delete_password, "delete");
        done()
      })
  })

  let replyid

  test("Creating a new reply", (done) => {
    chai
      .request(server)
      .post("/api/replies/myTest")
      .send({
        thread_id: id,
        text: "testReply",
        delete_password: "delete"
      })
      .end((err, res) => {
        replyid = res.body.replies[0]._id
        assert.equal(res.status, 200);
        assert.equal(res.body.replies[0].text, "testReply");
        assert.lengthOf(res.body.replies, 1);
        done()
      })
  })

  test("Viewing a single thread with all replies", (done) => {
    chai
      .request(server)
      .get("/api/replies/myTest?thread_id=" + id)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.replies[0].text, "testReply");
        done();
      })
  })

  test("Deleting a reply with the incorrect password", (done) => {
    chai
      .request(server)
      .delete("/api/replies/myTest")
      .send({
        thread_id: id,
        delete_password: "notDelete",
        reply_id: replyid
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body, "incorrect password");
        done()
      })
  })

  test("Deleting a reply with the correct password", (done) => {
    chai
      .request(server)
      .delete("/api/replies/myTest")
      .send({
        thread_id: id,
        delete_password: "delete",
        reply_id: replyid
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body, "success");
        done()
      })
  })

  test("Reporting a reply", (done) => {
    chai
      .request(server)
      .put("/api/replies/myTest")
      .send({
        thread_id: id,
        reply_id: replyid
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body, "success");
        done()
      })
  })

});