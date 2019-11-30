module.exports = (sequelize, DataTypes) => {
  const document = sequelize.define('document', {
    matricula: DataTypes.STRING,
    nome_arquivo: DataTypes.STRING,
    conteudo: DataTypes.STRING,
    tipo: DataTypes.STRING,
    confiavel: DataTypes.INTEGER,
  });

  return document;
};
