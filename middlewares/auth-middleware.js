const jwt = require('jsonwebtoken');
const { Users } = require('../models');

// 사용자 인증 미들웨어

module.exports = async (req, res, next) => {
  const { authorization } = req.cookies;
  // 쿠키를 받아올거다.
  // name : authorization
  // value : Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4MjQ4OTIwMX0.XTEqZJ83x6UuCpQj6x9NIqOrpjvq6gVoA1meTD1o4-4

  // req.cookies 형태로 전달받을 수 있도록 하기 위해서는
  // cookieParser를 전역 미들웨어에 등록을 해야지만 사용가능했었음
  // 그러기 위해서는 app.js 에 cookie-parser 임포트와
  // app.use(cookieParser())가 있어야함

  // app.js에 cookie parser가 정상적으로 등록되있다면
  // req.cookies를 사용가능함.
  
  if (!authorization) {
    // authorization header is missing
    return res.status(401).json({ message: "로그인이 필요한 기능입니다." });
  }

  const [tokenType, token] = authorization.split(" ");
  // cookie value에 Bearer afdafasfasf 적혀있는걸 구분해서 가져올거다.

  // tokenType이 Bearer가 아닐 때
  // 또는 token 이 비었을 때 Error 발생
  // Error 발생
  if (tokenType !== "Bearer" || !token) {
    return res.status(401).json({ errorMessage: "로그인이 필요한 기능입니다."});
  }

  // 그 다음으로는 token을 디코딩 해봐야함
  // 디코딩 하기위해서는 jwt 라이브러리가 필요하기 떄문에
  // 위에다가 const jwt = require('jsonwebtoken'); 추가
  // 그리고 디코드가 쉴패했을 때 에러를 띄우기 위해 try..catch 구문 사용하는 것
  try {
    // token을 디코드할거고, 키는 jwt생성할 때 사용하였던
    // secret-key인 "customized_secret_key"을 사용
    const decodedToken = jwt.verify(token, "customized_secret_key");

    // 디코드를 통해 복호화가 완료되었기 때문에 저기서 정보를 가져올 거다.
    const userId = decodedToken.userId;

    // 그리고 실재로 유저 정보를 찾아야함
    // Users 디비를 사용하려면 맨 위에
    // const { Users } = require('../models'); 추가
    // MongoDB과 다른 부분은 여기 where절 밖에 없음
    const user = await Users.findOne({ where: { userId}});

    // 만약 검색한 유저가 없다면 Error 발생
    if (!user) {
      return res.status(401).json({ errorMessage: "로그인에 실패하였습니다."});
    }

    // 모든 검증을 통과했다라면은
    // res.locals.user에 user 정보를 모두 집어넣어라.
    res.locals.user = user;

    // 그다음 next로 넘깁니다.
    next();
  } catch (error) {
    return res.status(401).json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다."});
  };
};