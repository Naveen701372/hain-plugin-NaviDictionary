'use strict';

const lo_take = require('lodash.take');
const got = require('got');
const fs = require('fs');
const path = require('path');

function fetchWords(query) {
  const query_enc = encodeURIComponent(query);
  const url = `https://owlbot.info/api/v1/dictionary/${query}?format=json`;
  return got(url).then((res) => {
    const dict = JSON.parse(res.body);
    const items = dict.items;
    const words = lo_take(items[0], 5);
    return words;
  });
}

function fetchDictionary(word) {
  const query = encodeURIComponent(word);
  const url = `https://owlbot.info/api/v1/dictionary/${query}?format=json`;
  return got(url).then(res => res.body);
}

module.exports = (context) => {
  const app = context.app;
  const shell = context.shell;
  let html = '';

  function startup() {
    html = fs.readFileSync(path.join(__dirname, 'html-wrapper.html'), 'utf8');
  }

  function search(query, res) {
    if (query.length <= 0) {
      res.add({
        title: 'Please enter something',
        desc: 'hain-plugin-NaviDictionary'
      });
      return;
    }
    const query_lower = query.toLowerCase();
    fetchWords(query_lower).then((words) => {
      const results = words.map((x) => {
        return {
          id: x[0][0],
          title: x[0][0],
          desc: x[1][0],
          redirect: `?${x[0][0]}`,
          preview: true
        };
      });
      res.add(results);
    });
  }

  function execute(id, payload) {
    if (id === undefined)
      return;
    const query = encodeURIComponent(id);
    const url = `https://owlbot.info/api/v1/dictionary/${query}?format=json`;
    shell.openExternal(url);
    app.close();
  }

  function renderPreview(id, payload, render) {
    fetchDictionary(id).then((body) => {
      render(html.replace('%body%', body));
    });
  }

  return { startup, search, execute, renderPreview };
};