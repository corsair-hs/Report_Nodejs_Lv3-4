const express = require('express');
const { Posts, Users, Likes } = require("../models"); // Posts DB 임포트
const { Op } = require("sequelize");    // Op 임포트
const sequelize = require('sequelize');
const authMiddleware = require("../middlewares/auth-middleware"); // 사용자 인증 미들웨어 임포트
const router = express.Router();

// 게시글 생성
router.post("/posts", authMiddleware, async (req, res) => {
  try {
    // 게시글 생성하는 사용자 정보 가져오기
    // 게시글 생성자는 로그인한 사용자만 할 수 있기 때문에
    // 로그인된 사용자를 구분하기 위해서 사용자 인증 미들웨어를 사용할 것임
    // 그러기 위해서는 맨위에 const authMiddleware = require("../middlewares/auth-middleware"); 임포트
    // router.post("/posts", authMiddleware, ... )를 등록해야함
    const { userId } = res.locals.user;
    console.log(userId)

    // body 데이터에서 title, content 받아오고
    const { title, content } = req.body;

    try {
      if (!title) {
        return res.status(412).json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
      } else if (!content) {
        return res.status(412).json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
      }

      // Posts DB에 생성
      const post = await Posts.create({
        UserId: userId,
        title,
        content,
      });
      return res.status(201).json({ message: "게시글 작성에 성공하였습니다." });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ errorMessage: "게시글 작성에 실패하였습니다." });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
  }
});


// 게시글 목록 조회
router.get("/posts", async (req, res) => {
  try {
    const posts = await Posts.findAll({
      attributes: ["postId", "UserId", "title", "createdAt", "updatedAt"],
      include: [
        {
          model: Users,
          attributes: ["nickname"],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const postsResult = posts.map((item) => {
      return {
        postId: item.postId,
        userId: item.UserId,
        nickname: item.User.nickname,
        title: item.title,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    });

    return res.status(200).json({ posts: postsResult });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

// 좋아요 게시글 조회
router.get("/posts/like", authMiddleware, async (req, res) => {
  try {
    res.locals.user;
    const getLikes = await Likes.findAll({
      attributes: [
        ['PostId', 'postId'], 
        ['UserId', 'userId'], 
        [sequelize.literal('(SELECT nickname FROM Users WHERE Users.userId = (SELECT UserId FROM Posts WHERE Posts.postId = Likes.PostId))'), 'nickname'],
        [sequelize.literal('(SELECT title FROM Posts WHERE Posts.postId = Likes.PostId)'), 'title'],
        'createdAt', 
        'updatedAt',
        [sequelize.fn('COUNT', sequelize.col('PostId')), 'like'],
      ],
      group: ['PostId'],
    })
    return res.status(200).json({ posts: getLikes });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errorMessage: "좋아요 게시글 조회에 실패하였습니다." });
  }
});

// 게시글 상세 조회
router.get("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Posts.findOne({
      attributes: ["postId", "UserId", "title", "content", "createdAt", "updatedAt"],
      include: [
        {
          model: Users,
          attributes: ["nickname"],
        },
      ],
      where: { postId }
    });

    const postResult = {
        postId: post.postId,
        userId: post.UserId,
        nickname: post.User.nickname,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      };

    return res.status(200).json({ post: postResult });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});


// 게시글 수정
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const { title, content } = req.body;

    try {
      if (!title) {
        return res.status(412).json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
      } else if (!content) {
        return res.status(412).json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
      }

      // 게시글을 조회합니다.
      const post = await Posts.findOne({ where: { postId } });

      if (!post) {
        return res.status(403).json({ errorMessage: "게시글이 존재하지 않습니다." });
      } else if (post.UserId !== userId) {
        return res.status(403).json({ errorMessage: "게시글 수정의 권한이 존재하지 않습니다." });
      }

      // 게시글의 권한을 확인하고, 게시글을 수정합니다.
      await Posts.update(
        { title, content }, // title과 content 컬럼을 수정합니다.
        {
          where: {
            [Op.and]: [{ postId }, { UserId: userId }],
          }
        }
      );

      return res.status(200).json({ message: "게시글을 수정하였습니다." });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ errorMessage: "게시글이 정상적으로 수정되지 않았습니다." });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
  }
});


// 게시글 삭제
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = res.locals.user;

    // 게시글을 조회합니다.
    const post = await Posts.findOne({ where: { postId } });

    if (!post) {
      return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
    } else if (post.UserId !== userId) {
      return res.status(403).json({ errorMessage: "게시글의 삭제 권한이 존재하지 않습니다." });
    }

    // 게시글의 권한을 확인하고, 게시글을 삭제합니다.
    await Posts.destroy({
      where: {
        [Op.and]: [{ postId }, { UserId: userId }],
      }
    });

    return res.status(200).json({ data: "게시글이 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errorMessage: "게시글이 정상적으로 삭제되지 않았습니다." });
  }
});


module.exports = router;