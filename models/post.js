'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
  }
  Post.init({
    userId: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    mediaUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};