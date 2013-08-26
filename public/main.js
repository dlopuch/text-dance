// sketchbook common config
require(["/sketchbook_config.js"], function() {

require(
  ["jquery", "parse/ImportAndParse", "parse/ConversationCrawler", "plot/ConversationPlotView"],
  function($, ImportAndParse, ConversationCrawler, ConversationPlotView) {

    ImportAndParse.done(function(rows) {
      window.rows = rows;
      window.conversations = ConversationCrawler(rows);
    });

    var _colorScale = d3.scale.linear()
      .domain([conversations[0].texts[0][0].getTime(),
               conversations[conversations.length - 1].texts[conversations[conversations.length - 1].texts.length - 1][0].getTime() ])
      .range(['#C51B8A', '#FDE0DD']);
    window.colorScale = function(d) {
      return _colorScale(d.texts[0][0].getTime());
    };

    window.plot = new ConversationPlotView();
    $('body').append(plot.el);
    plot.render(conversations, {
      colorScale: colorScale
    });
  }
);

});