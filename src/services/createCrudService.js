const AppError = require("../errors/AppError");

const createCrudService = ({ repository, entityName }) => {
  const getById = async (id) => {
    const entity = await repository.getById(id);

    if (!entity) {
      throw new AppError(`${entityName} not found`, 404);
    }

    return entity;
  };

  return {
    async getAll() {
      return repository.getAll();
    },

    getById,

    async create(data) {
      return repository.create(data);
    },

    async update(id, data) {
      await getById(id);
      return repository.update(id, data);
    },

    async remove(id) {
      const deleted = await repository.remove(id);

      if (!deleted) {
        throw new AppError(`${entityName} not found`, 404);
      }

      return { id: Number(id) };
    }
  };
};

module.exports = createCrudService;
