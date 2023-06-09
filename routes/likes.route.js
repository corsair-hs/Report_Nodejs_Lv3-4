const express = require('express');
const { Posts, Users, Likes } = require("../models"); // Posts DB 임포트
const { Op } = require("sequelize");    // Op 임포트
const sequelize = require('sequelize');
const authMiddleware = require("../middlewares/auth-middleware"); // 사용자 인증 미들웨어 임포트
const router = express.Router();

// 좋아요
router.put("/posts/:postId/like", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { postId } = req.params;

    const getExistPost = await Posts.findOne({ where: { postId } });
    if (!getExistPost) {
      return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
    };

    const getExistLike = await Likes.findOne({
      where: {
        [Op.and]: [{ PostId: postId }, { UserId: userId }]
      }
    });

    if (!getExistLike) {
      await Likes.create({ PostId: postId, UserId: userId });
      return res.status(200).json({ message: "게시글의 좋아요를 등록하였습니다." });
    } else {
      await Likes.destroy(
        {
          where: {
            [Op.and]: [{ PostId: postId }, { UserId: userId }]
          }
        }
      );
      return res.status(200).json({ message: "게시글의 좋아요를 취소하였습니다." });
    };
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errorMessage: "게시글 좋아요에 실패하였습니다." });
  }
});


// // 좋아요 게시글 조회
router.get("/posts/like", authMiddleware, async (req, res) => {
  try {
    res.locals.user;
    const getLikes = await Posts.findAll({
      attributes: ['postId', 'title', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Users,
          attributes: ['userId', 'nickname']
        },
        {
          model: Likes,
          attributes: [[sequelize.fn('COUNT', sequelize.col('Likes.PostId')), 'count']]
        } 
      ],
      group: ['postId'],
      order: [['createdAt', 'DESC']],
    });

    const setLikes = getLikes.map((item)=>{
      return {
        postId: item.postId,
        userId: item.User.userId,
        nickname: item.User.nickname,
        title: item.title,
        like: item.Likes[0].dataValues.count,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    });
    return res.status(200).json({ posts: setLikes });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errorMessage: "좋아요 게시글 조회에 실패하였습니다." });
  }
});


module.exports = router;