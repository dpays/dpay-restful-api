const express = require('express');
const decamelize = require('decamelize');
const _ = require('lodash');
const dpay = require('dpayjs');
const methodsMap = require('dpayjs/lib/api/methods.js');

const methods = methodsMap.default;
const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('https://library.dpays.io/docs/dpayjs');
});

router.post('/rpc', (req, res) => {
  const { method, params, id } = req.body;
  const mapping = _.filter(methods, { method: method });
  dpay.api.send(mapping[0].api, {
    method: method,
    params: params,
  }, (err, result) => {
    res.send({
      jsonrpc: '2.0',
      id,
      method,
      result,
    });
  });
});

router.get('/:method', (req, res) => {
  const query = parseQuery(req.query);
  const method = decamelize(req.params.method, '_');
  const mapping = _.filter(methods, { method: method });
  let params = [];
  if (mapping[0].params) {
    mapping[0].params.forEach((param) => {
      const queryParam = query[param] || query[decamelize(param)];
      params.push(queryParam);
    });
  }
  dpay.api.send(mapping[0].api, {
    method: method,
    params: params
  }, (err, result) => {
    const json = query.scope
      ? result[query.scope] : result;
    res.json(json);
  });
});

const parseQuery = (query) => {
  let newQuery = {};
  Object.keys(query).map(key => {
    let value = query[key];
    try { value = JSON.parse(decodeURIComponent(value)); }
    catch (e) { }
    newQuery[key] = value;
  });
  return newQuery;
};

module.exports = router;
