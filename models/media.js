'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Media extends Model {

  }
  Media.init({
    postId: DataTypes.INTEGER,
    url: DataTypes.STRING,
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Media',
  });
  return Media;
};