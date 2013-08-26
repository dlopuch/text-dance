// sketchbook common config
require(["/sketchbook_config.js"], function() {

require(
  ["jquery", "parse/ImportAndParse", "parse/ConversationCrawler"],
  function($, ImportAndParse, ConversationCrawler) {

    ImportAndParse.done(function(rows) {
      window.rows = rows;
      window.conversations = ConversationCrawler(rows);
    });
  }
);

});