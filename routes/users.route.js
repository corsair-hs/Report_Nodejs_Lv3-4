const express = require('express');
const jwt = require('jsonwebtoken');
const { Users } = require("../models");
const router = express.Router();

// 회원가입
router.post("/signup", async (req, res) => {
  try {
    const { nickname, password, confirm } = req.body;
    const isExistUser = await Users.findOne({ where: { nickname } });

    // 닉네임 중복 검증
    if (isExistUser) {
      return res.status(412).json({ errorMessage: "중복된 닉네임입니다." });
    }

    // 닉네임 최소 3글자 이상, 알파벳 대소문자, 숫자 외 에러메세지
    if ((!/^[a-zA-Z0-9]+$/.test(nickname)) || (nickname.length < 4)) {
      res.status(412).json({
        errorMessage: "닉네임의 형식이 일치하지 않습니다."
      });
      return;
    };

    // 패스워드, 확인패스워드 일치 검증
    if (password !== confirm) {
      res.status(412).json({
        errorMessage: "패스워드가 일치하지 않습니다."
      });
      return;  // 패스워드 검증이 실패하면 뒤에는 실행시키지 않도록 return으로 브레이크
    };

    // 패스워드 닉네임을 포함시키면 에러메세지
    if (password.includes(nickname)) {
      res.status(412).json({
        errorMessage: "패스워드에 닉네임이 포함되어 있습니다."
      });
      return;
    };

    // 패스워드 4글자 이하이면 에러메세지 
    if (password.length <= 4) {
      res.status(412).json({
        errorMessage: "패스워드 형식이 일치하지 않습니다."
      });
      return;
    };

    // Users 테이블에 사용자를 추가합니다.
    const user = await Users.create({ nickname, password });
    // UserInfos 테이블에 사용자 정보를 추가합니다.

    return res.status(201).json({ message: "회원 가입에 성공하였습니다." });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  try {
    const { nickname, password } = req.body;
    const user = await Users.findOne({ where: { nickname } });
    if (!user || user.password !== password) {  // 해당 사용자 존재? 또는 해당 사용자의 비밀번호 존재?
      return res.status(401).json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
    }
    const token = jwt.sign({  // jwt 생성
      userId: user.userId
    }, "customized_secret_key");
    res.cookie("authorization", `Bearer ${token}`); // cookie 발급 -> res 할당
    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errorMessage: "로그인에 실패하였습니다." });
  }
});

// 사용자 조회 - 테스트용
router.get("/users", async (req, res) => {
  const users = await Users.findAll({
    attributes: ["userId", "nickname", "password", "createdAt", "updatedAt"],
    order: [['createdAt', 'DESC']]
  });
  return res.status(200).json({ data: users });
});

// 사용자 삭제 - 테스트용
router.delete("/users/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    // 사용자 조회
    const getExistUser = await Users.findOne({ where: { userId } });
    if (!getExistUser) {
      return res.status(404).json({ errorMessage: "사용자가 존재하지 않습니다." });
    }
    // 사용자 삭제
    await Users.destroy({
      where: { userId }
    });
    return res.status(200).json({ message: "사용자 삭제 완료" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errorMessage: "사용자 삭제 실패" });
  }
});


module.exports = router;