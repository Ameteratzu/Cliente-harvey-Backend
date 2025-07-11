const db = require("../database/models/index.js");

const deleteExpiredPublication = async () => {
  const expiredPublications = await db.PublishedProducts.findAll({
    where: {
      publishedEndDate: { [db.Sequelize.Op.lt]: new Date() },
    },
  });

  for (const publication of expiredPublications) {
    await publication.destroy();
  }

  console.log(`${expiredPublications.length} publicaciones eliminadas.`);
};

module.exports = deleteExpiredPublication;
