# 기능 구현은 했으나, 아직 미해결 부분

## 좋아요 게시글 조회 기능
### Issue-1: GET "/posts/like"
게시글 상세조회( GET "posts/:postId")와의 충돌이 나는지,   
like를 자꾸만 :postId로 인식하는 문제가 있음.   
그래서 "좋아요 게시글 조회" 소스를   
posts.route.js의 "게시글 상세 조회" GET "/posts/:postId" 위에다 옮긴 점.   
posts.route.js 쪽으로 옮기지 않고 해결할 방법 찾아야함   

### Issue-2: GET "/posts/like"
