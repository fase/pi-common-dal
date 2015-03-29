var Promise = require('bluebird')
  , _ = require('lodash')
  , that = this;

exports.getAll = function(model, query, page, limit) {
  return new Promise(function(resolve, reject) {
    model
      .findAndCountAll({
        where: query,
        offset: ((page - 1) * limit),
        limit: limit
      })
      .then(function(matches) {
        if(!matches) {
          reject({statusCode: 404});
        } else {
          resolve(matches);
        }
      })
      .catch(function(err) {
        reject({statusCode: 500});
      });
  });
};

exports.getById = function(model, id) {
  return new Promise(function(resolve, reject) {
    that
      .getAll(model, {id: id}, 1, 1)
      .then(function(data) {
        if(data && data.rows && data.rows.length === 1) {
          resolve(data.rows[0]);
        } else if(data && data.rows && data.rows.length === 0) {
          reject({ statusCode: 404 });
        } else {
          reject({ statusCode: 500 });
        }
      })
      .catch(function(err){
        reject(err);
      });
  });
};

exports.create = function(model, data) {
  return new Promise(function(resolve, reject) {
    model
      .build(data)
      .save()
      .then(function(match) {
          if (!match) {
            reject({ statusCode: 500 });
          } else {
            resolve(match);
          }
        })
      .catch(function(err) {
        reject({ statusCode: 500 });
      });
  });
};

exports.updateById = function(model, data) {
  return new Promise(function(resolve, reject) {
    model
      .update(data, {
        where: { id: data.id }
      })
      .then(function(results) {
        if(results && results.length > 0) {
          resolve({id: data.id, rowsAffected: results[0]});
        } else {
          reject({ statusCode: 404 })
        }
      })
      .catch(function(err) {
        reject({ statusCode: 500 });
      });
  });
};

exports.deleteById = function(model, id) {
  return new Promise(function(resolve, reject) {
    model
      .destroy({ where: { id: id } })
      .then(function(match) {
        if(match) {
          resolve(id);
        } else {
          reject({ statusCode: 404 });
        }
      })
      .catch(function(err) {
        reject({ statusCode: 500 });
      });
  });
};

exports.total = function(model, query, distinct) {
  distinct = distinct || false;
  return new Promise(function(resolve, reject) {
    model
      .count({
        where: query,
        distinct: distinct
      })
      .then(function(total) {
        resolve(total);
      })
      .catch(function(err) {
        reject({ statusCode: 500 });
      });
  });
};

exports.getChildren = function(model, parentId, page, limit) {
  return new Promise(function(resolve, reject) {
    that
      .getAll(model, { parentOrganizationId: parentId }, page, limit)
      .then(function (data) {
        resolve(data);
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

exports.getParent = function(model, id) {
  return new Promise(function(resolve, reject) {
    // First get the supplier that matches the id provided.
    that
      .getById(model, id)
      .then(function(child) {
        // If we could not find the supplier, return a 500.  It might make more sense to return a 404
        //  but we also return a 404 if the parent is not found so this could be confusing.
        if(!child) {
          reject({ statusCode: 500 });
        } else {
          // Then get the parent supplier referenced by the child's parentOrganizationId.
          that.getById(model, child.parentOrganizationId)
            .then(function(parent) {
              if(!parent) {
                reject({ statusCode: 500 });
              } else {
                resolve(parent);
              }
            })
            .catch(function(err){
              // If the error has a status code attached to it, pass it along.
              if(err && err.statusCode) {
                reject(err);
              } else {
                reject({ statusCode: 500 });
              }
            });
        }
      })
      .catch(function(err) {
        reject(err);
      });
  });
};