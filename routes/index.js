const express = require('express');

const Users = require('./users.route.js');
const Posts = require('./posts.route.js');
const Comments = require('./comments.route.js');
const Likes = require('./likes.route.js');

const router = express.Router();

router.use('/', Users);
router.use('/', Likes);
router.use('/', Posts);
router.use('/', Comments);


module.exports = router;