# 기능 구현은 했으나, 아직 미해결 부분

## 좋아요 게시글 조회 기능
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
원래는 아래처럼 include해서 getLikes에 모든 속성들을 담아놓고   
getLikes.map()으로 순회하면서 setLikes 변수에 필요한 속성만 담으려 했으나,   
가상으로 만든 Likes 같은 속성이 담기질 않음   
.
그래서 [...getLikes].map()으로 내용을 아예 복사를 해서 map() 순회해봤으나 무용지물...   
.   
일단 위의 코드처럼 한번에 뽑아내긴 했으나, RAW SQL문이 들어갔으므로, 좋지 못한 코딩 같음