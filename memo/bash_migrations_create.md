
```bash

# Users Model
npx sequelize model:generate --name Users --attributes email:string,password:string

# UserInfos Model
npx sequelize model:generate --name UserInfos --attributes UserId:integer,name:string,age:integer,gender:string,profileImage:string

# Posts Model
npx sequelize model:generate --name Posts --attributes UserId:integer,title:string,content:string

# Comments Model
npx sequelize model:generate --name Comments --attributes UserId:integer,PostId:integer,comment:string

# Likes Model
npx sequelize model:generate --name Likes --attributes UserId:integer,PostId:integer

# create Table code ------------------------------------------------------

# config/config.json에 설정된 DB를 생성합니다. 
npx sequelize db:create

# 해당 프로젝트에 Migrations에 정의된 테이블을 모두 MySQL에 생성합니다.
npx sequelize db:migrate

# 만약 migrations/*-create-comments.js 만 MysQL에 생성하고자 한다면?
npx sequelize db:migrate --to *-create-comments.js

# create Table : Undo -----------------------------------------------------

# 만약 방금 생성한 MySQL을 되돌리고자 한다면?
npx sequelize db:migrate:undo

# 특정 마이그레이션으 되돌리려면 --to 옵션과 파일명으로 실행
npx sequelize db:migrate:undo --to *-create-comments.js

```