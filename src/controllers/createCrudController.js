const createCrudController = ({ service, views }) => ({
  async getAll(req, res, next) {
    try {
      const items = await service.getAll(req);
      views.showAll(res, items);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const item = await service.getById(req.params.id, req);
      views.showOne(res, item);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const item = await service.create(req.body, req);
      views.showOne(res, item, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const item = await service.update(req.params.id, req.body, req);
      views.showOne(res, item);
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const deleted = await service.remove(req.params.id, req);
      views.showDeleted(res, deleted.id);
    } catch (error) {
      next(error);
    }
  }
});

module.exports = createCrudController;
