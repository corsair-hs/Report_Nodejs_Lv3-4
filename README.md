# 기능 구현은 했으나, 아직 미해결 부분

## 0. 가장 궁금한 부분
### table 생성하는 방식: 1) migrations 이용 2) models 이용
강의에서는 models를 이용해 만드는 방식은 제한사항이나 오류가능성이 있기 때문에 비추한다고 했음   
하지만, 강의에서는 models를 이용해 tbl을 만들었음.   
프로젝트 진행 또한 models 테이블 속성 정의된 파일을 가지고 진행했음.   
migrations로 tbl을 만든 후 진행한다면, models 파일들에 테이블 속성을 지정안해도 되는 건인가?   
그리고 프로젝트 진행시 테이블 속성값 불러올 때, migrations 파일들을 불러오면 되는 건인가?   
에 대한 의문점이 아직 남아있음.   
models를 이용안하고 migrations 파일들로만 프로젝트 구현 테스트 해봐야겠음.   

## 1. 좋아요 게시글 조회 기능
### Issue-1: GET "/posts/like"
게시글 상세조회( GET "posts/:postId")와의 충돌이 나는지,   
like를 자꾸만 :postId로 인식하는 문제가 있음.   
그래서 "좋아요 게시글 조회" 소스를   
posts.route.js의 "게시글 상세 조회" GET "/posts/:postId" 위에다 옮긴 점.   
posts.route.js 쪽으로 옮기지 않고 해결할 방법 찾아야함   

### Issue-2: GET "/posts/like"
``` javascript
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
```
원래는 (Users.nickname, Posts.title)을 include해서 getLikes에 모든 속성들을 담아놓고   
getLikes.map()으로 순회하면서 setLikes 변수에 필요한 속성만 담으려 했으나,   
가상으로 만든 Like 같은 속성이 담기질 않음   
.
그래서 [...getLikes].map()으로 내용을 아예 복사를 해서 map() 순회해봤으나 무용지물...   
.   
일단 위의 코드처럼 한 번에 뽑아내긴 했으나, RAW Query문이 들어갔으므로, 좋지 못한 코딩 같음

## 2. routes/index.route.js 활용 방법 찾아야 함
### AS-IS: app.js 에서 route.js들 직접 임포트 및 호출 중
``` JavaScript
const express = require("express");
const cookieParser = require("cookie-parser");

const usersRouter = require('./routes/users.route');  // 하나하나 임포트중
const postsRouter = require('./routes/posts.route');
const commentsRouter = require('./routes/comments.route');
const likesRouter = require('./routes/likes.route');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use('/', [usersRouter, postsRouter, commentsRouter, likesRouter]);  // 하나하나 호출

app.listen(PORT, () => {
  console.log(PORT, '포트 번호로 서버가 실행되었습니다.');
})
```
### TO-BE: routes/index.route.js 활용해서 app.js에서 한 번에 임포트 및 호출
``` JavaScript
const express = require('express');
const cookieParser = require('cookie-parser');

const routes = require('./routes'); // 한 번에 임포트

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

app.use('/', routes); // 한 번에 호출

app.listen(port, () => {
  console.log(`Start listen Server: ${port}`);
});

module.exports = app;
```
이렇게 하면 될 것 같은데, 자꾸 에러 발생, /routes 경로를 왜 못찾는다고 하는건지원...
``` bash
node:internal/modules/cjs/loader:1078
  throw err;
  ^

Error: Cannot find module './routes'
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    'C:\\Users\\AllA\\Documents\\github-clone\\Report_Nodejs_Lv3-4\\app.js'
  ]
}

Node.js v18.15.0
```
아... 혹시나 해본 방법이 되버렸다....   
routes/index.route.js 파일명이 문제였나보다.   
index.* 파일들은 보통 다른 데서도 기본 첫페이지를 담당하는 애들인데   
이걸 임으로 다른 명칭을 사용했더니 안됬었나보다...   
결론, index.js 파일명은 건들지 말 것