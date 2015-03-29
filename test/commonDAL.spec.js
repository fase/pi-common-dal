'use strict';

var should = require('should')
  , sinon = require('sinon')
  , Promise = require('bluebird')
  , commonDAL = require('../index');

require('should-promised');

describe('commonDAL', function() {

  describe('#getAll', function () {
    it('should call findAndCountAll and return data', function () {
      // ARRANGE
      var val = { "foo": "bar" };

      var model = {
        findAndCountAll: sinon.stub().returns(Promise.resolve(val))
      };

      // ACT
      var promise = commonDAL.getAll(model, {}, 1, 1);

      // ASSERT
      return promise.should.be.Promise.and.fulfilledWith(val);
    });

    it('should throw if query returns null', function () {
      // ARRANGE
      var model = {
        findAndCountAll: sinon.stub().returns(Promise.resolve(null))
      };

      // ACT
      var promise = commonDAL.getAll(model, {}, 1, 1);

      // ASSERT
      return promise.should.be.Promise.and.rejectedWith({ statusCode: 404 });
    });
  });

  describe('#getById', function() {
    it('should retrieve a match', function() {
      // ARRANGE
      var val = { "foo": "bar" };

      var model = {
        findAndCountAll: sinon.stub().returns(Promise.resolve({ rows: [val] }))
      };

      // ACT
      var promise = commonDAL.getById(model, 1);

      // ASSERT
      return promise.should.be.Promise.and.fulfilledWith(val);
    });

    it('should reject if query returns no rows', function () {
      // ARRANGE
      var model = {
        findAndCountAll: sinon.stub().returns(Promise.resolve({ rows: [] }))
      };

      // ACT
      var promise = commonDAL.getById(model, 1);

      // ASSERT
      return promise.should.be.Promise.and.rejectedWith({ statusCode: 404 });
    });

    it('should reject if query returns undefined', function () {
      // ARRANGE
      var model = {
        findAndCountAll: sinon.stub().returns(Promise.resolve(undefined))
      };

      // ACT
      var promise = commonDAL.getById(model, 1);

      // ASSERT
      return promise.should.be.Promise.and.rejectedWith({ statusCode: 404 });
    });

    it('should throw if query returns undefined', function () {
      // ARRANGE
      var model = {
        findAndCountAll: sinon.stub().throws()
      };

      // ACT
      var promise = commonDAL.getById(model, 1);

      // ASSERT
      return promise.should.be.Promise.and.rejected;
    });
  });

  describe('#create', function() {
    it('should save a new object', function() {
      // ARRANGE
      var match = { "foo": "bar" };

      var obj = {
        save: function() {
          return Promise.resolve(match);
        }
      };

      var model = {
        build: function() {
          return obj;
        }
      };

      // ACT
      var promise = commonDAL.create(model, {});

      // ASSERT
      return promise.should.be.Promise.and.fulfilledWith(match);
    });

    it('should reject if match is undefined', function() {
      // ARRANGE
      var match = undefined;

      var obj = {
        save: function() {
          return Promise.resolve(match);
        }
      };

      var model = {
        build: function() {
          return obj;
        }
      };

      // ACT
      var promise = commonDAL.create(model, {});

      // ASSERT
      return promise.should.be.Promise.and.rejectedWith({ statusCode: 500 });
    });

    it('should catch if save throws', function() {
      // ARRANGE
      var obj = {
        save: sinon.stub().throws()
      };

      var model = {
        build: function() {
          return obj;
        }
      };

      // ACT
      var promise = commonDAL.create(model, {});

      // ASSERT
      return promise.should.be.Promise.and.rejected;
    });
  });

  describe('#updateById', function() {
    it('should update a match and return the id and rows affected', function() {
      // ARRANGE
      var rowsAffected = { "foo": "bar" };
      var idValue = 1;

      var model = {
        update: sinon.stub().returns(Promise.resolve([rowsAffected]))
      };

      // ACT
      var promise = commonDAL.updateById(model, { id: idValue });

      // ASSERT
      return promise.should.be.Promise.and.fulfilledWith({ id: idValue, rowsAffected: rowsAffected });
    });

    it('should reject if query updates no rows', function() {
      // ARRANGE
      var model = {
        update: sinon.stub().returns(Promise.resolve([]))
      };

      // ACT
      var promise = commonDAL.updateById(model, { id: 1 });

      // ASSERT
      return promise.should.be.Promise.and.rejectedWith({ statusCode: 404 });
    });

    it('should throw if query updates no rows', function() {
      // ARRANGE
      var model = {
        update: sinon.stub().throws()
      };

      // ACT
      var promise = commonDAL.updateById(model, { id: 1 });

      // ASSERT
      return promise.should.be.Promise.and.rejected;
    });

  });

  describe('#deleteById', function() {
    it('should delete a match and return the id', function() {
      // ARRANGE
      var matchedObject = {};
      var idValue = 1;

      var model = {
        destroy: sinon.stub().returns(Promise.resolve(matchedObject))
      };

      // ACT
      var promise = commonDAL.deleteById(model, idValue);

      // ASSERT
      return promise.should.be.Promise.and.fulfilledWith(idValue);
    });

    it('should reject if id not found', function() {
      // ARRANGE
      var model = {
        destroy: sinon.stub().returns(Promise.resolve(undefined))
      };

      // ACT
      var promise = commonDAL.deleteById(model, 1);

      // ASSERT
      return promise.should.be.Promise.and.rejectedWith({ statusCode: 404 });
    });

    it('should throw if query updates no rows', function() {
      // ARRANGE
      var model = {
        destroy: sinon.stub().throws()
      };

      // ACT
      var promise = commonDAL.deleteById(model, { id: 1 });

      // ASSERT
      return promise.should.be.Promise.and.rejected;
    });

  });

  describe('#updateById', function() {
    it('should update a match and return the id and rows affected', function() {
      // ARRANGE
      var rowsAffected = 10;
      var model = {
        count: sinon.stub().returns(Promise.resolve(rowsAffected))
      };

      // ACT
      var promise = commonDAL.total(model, {});

      // ASSERT
      return promise.should.be.Promise.and.fulfilledWith(rowsAffected);
    });

    it('should throw if query updates no rows', function() {
      // ARRANGE
      var model = {
        count: sinon.stub().throws()
      };

      // ACT
      var promise = commonDAL.total(model, {});

      // ASSERT
      return promise.should.be.Promise.and.rejected;
    });

  });

  describe('#getChildren', function() {
    it('should return existing child matches if they exist', function() {
      // ARRANGE
      var parentId = 1;
      var match = { "foo": "bar" };

      var model = {
        findAndCountAll: sinon.stub().returns(Promise.resolve(match))
      };

      // ACT
      var promise = commonDAL.getChildren(model, parentId)

      // ASSERT
      promise.should.be.a.Promise.and.fulfilledWith(match);
    });

    it('should reject if no child matches were found', function() {
      // ARRANGE
      var parentId = 1;
      var match = undefined;

      var model = {
        findAndCountAll: sinon.stub().returns(Promise.resolve(match))
      };

      // ACT
      var promise = commonDAL.getChildren(model, parentId)

      // ASSERT
      promise.should.be.Promise.and.rejectedWith({ statusCode: 404 });
    });
  });

  describe('#getParent', function() {
    it('should return an existing parent match if it exists', function() {
      // ARRANGE
      var parentId = 1;
      var parentData = { foo: "bar" };
      var match = { rows: [ parentData ] };

      var model = {
        findAndCountAll: sinon.stub().returns(Promise.resolve(match))
      };

      // ACT
      var promise = commonDAL.getParent(model, parentId);

      // ASSERT
      return promise.should.be.Promise.and.fulfilledWith(parentData);
    });

    it('should reject if no parent record found', function() {
      // ARRANGE
      var parentId = 1;
      var match = { rows: [] };

      var model = {
        findAndCountAll: sinon.stub().returns(Promise.resolve(match))
      };

      // ACT
      var promise = commonDAL.getParent(model, parentId);

      // ASSERT
      return promise.should.be.Promise.and.rejectedWith({ statusCode: 404 });
    });
  })

});