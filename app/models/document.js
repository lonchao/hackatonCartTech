module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('document', {
    matricula: DataTypes.STRING,
    nome_arquivo: DataTypes.STRING,
    conteudo: DataTypes.STRING,
  });

  return Document;
};
