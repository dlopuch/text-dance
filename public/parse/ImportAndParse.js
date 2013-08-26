define(["jquery"], function($) {

  var data = $.Deferred();

  d3.tsv('data/texts.tsv',
    function(d) {
      return {
        timestamp: new Date(d.text_ts),
        isSent: d.s_r === "SNT",
        numChars: +d.num_chars,
        numWords: +d.num_words,
        minSincePrev: +d.min_since_prev || -1
      };
    },
    function(error, rows) {
      if (error) {
        console.log("[ImportAndParse] Error parsing");
        data.reject(error);
      } else {
        console.log("[ImportAndParse] Done retreiving and parsing " + rows.length + " rows.");
        data.resolve(rows);
      }
    });

  console.log("[ImportAndParse] Requesting data");

  return data.promise();

});