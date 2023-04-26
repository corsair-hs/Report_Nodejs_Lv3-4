'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
      postId: {
        allowNull: false, // NOT NULL
        autoIncrement: true, // AUTO_INCREMENT
        primaryKey: true, // Primary Key (기본키)
        type: Sequelize.INTEGER
      },
      UserId: {
        allowNull: false, // NOT NULL
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // Users 테이블을 참조합니다.
          key: 'userId', // Users 테이블의 userId 컬럼을 참조합니다.
        },
        onDelete: 'CASCADE', // 만약 Users 테이블의 userId 값이 삭제되면, Posts 테이블의 데이터가 삭제됩니다.
      },
      Nickname: {
        allowNull: false, // NOT NULL
        type: Sequelize.STRING,
        unique: true,
        references: {
          model: 'Users', // Users 테이블을 참조합니다.
          key: 'nickname', // Users 테이블의 nickname 컬럼을 참조합니다.
        },
        onDelete: 'CASCADE', // 만약 Users 테이블의 userId 값이 삭제되면, Posts 테이블의 데이터가 삭제됩니다.
      },
      title: {
        allowNull: false, // NOT NULL
        type: Sequelize.STRING,
      },
      content: {
        allowNull: false, // NOT NULL
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false, // NOT NULL
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now")
      },
      updatedAt: {
        allowNull: false, // NOT NULL
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now")
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Posts');
  }
};