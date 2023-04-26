const express = require('express');
const { Posts, Users, Comments } = require("../models"); // Posts DB 임포트
const { Op } = require("sequelize");    // Op 임포트
const authMiddleware = require("../middlewares/auth-middleware"); // 사용자 인증 미들웨어 임포트
const router = express.Router();


// 댓글 생성
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
  try {
    try {
      const { userId } = res.locals.user;
      const { postId } = req.params;
      const { comment } = req.body;

      const getExistPost = await Posts.findOne({ where: { postId } });

      if (!getExistPost) {
        return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
      };

      await Comments.create({
        UserId: userId,
        PostId: postId,
        comment
      });
      return res.status(200).json({ message: "댓글을 작성하였습니다." });
    } catch (error) {
      console.error(error);
      return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errorMessage: "댓글 작성에 실패하였습니다." });
  }
})

// 댓글 목록 조회
router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;

    const getExistPost = await Posts.findOne({ where: { postId } });
    if (!getExistPost) {
      return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
    };

    const getComments = await Comments.findAll({
      include: [
        {
          model: Users,
          attributes: ["nickname"]
        }
      ],
      where: { postId },
      order: [['createdAt', 'DESC']],
    });

    const setComments = getComments.map((item) => {
      return {
        commentId: item.commentId,
        userId: item.UserId,
        nickname: item.User.nickname,
        comment: item.comment,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    })
    return res.status(200).json({ comments: setComments })
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errorMessage: "댓글 조회에 실패하였습니다." });
  };
});


// 댓글 수정
router.put("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;
    const { comment } = req.body;
    
    const getExistPost = await Posts.findOne({ where: { postId } });
    const getExistComment = await Comments.findOne({ where: { commentId} });

    if (!getExistPost) {
      return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
    } else if (!getExistComment) {
      return res.status(404).json({ errorMessage: "댓글이 존재하지 않습니다." });
    } else if (comment.length === 0){
      return res.status(400).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
    } else if ( userId !== getExistComment.UserId ) {
      return res.status(403).json({ errorMessage: "댓글의 수정 권한이 존재하지 않습니다." });
    }

    await Comments.update(
      { comment },
      {
        where: {
          [Op.and]: [{ commentId }, { PostId: postId }, { UserId: userId }]
        }
      }
    );
    return res.status(200).json({ message: "댓글을 수정하였습니다."});
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: "댓글 수정에 실패하였습니다." });
  }
});


// 댓글 삭제
router.delete("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;
    
    const getExistPost = await Posts.findOne({ where: { postId } });
    const getExistComment = await Comments.findOne({ where: { commentId} });

    if (!getExistPost) {
      return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
    } else if (!getExistComment) {
      return res.status(404).json({ errorMessage: "댓글이 존재하지 않습니다." });
    } else if ( userId !== getExistComment.UserId ) {
      return res.status(403).json({ errorMessage: "댓글의 삭제 권한이 존재하지 않습니다." });
    }

    await Comments.destroy(
      {
        where: {
          [Op.and]: [{ commentId }, { PostId: postId }, { UserId: userId }]
        }
      }
    );
    return res.status(200).json({ message: "댓글을 삭제하였습니다."});
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: "댓글 삭제에 실패하였습니다." });
  }
});

module.exports = router;