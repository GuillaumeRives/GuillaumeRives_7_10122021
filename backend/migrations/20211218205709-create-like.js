"use strict";
module.exports = {
   up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable("Likes", {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
         },
         userId: {
            type: Sequelize.INTEGER,
            references: {
               model: "Users",
               key: "id",
            },
            onDelete: "cascade",
            onUpdate: "no action",
         },
         postId: {
            type: Sequelize.INTEGER,
            references: {
               model: "Posts",
               key: "id",
            },
            onDelete: "cascade",
            onUpdate: "no action",
         },
         likeState: {
            type: Sequelize.BOOLEAN,
         },
         createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
         },
         updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
         },
      });
   },
   down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable("Likes");
   },
};
