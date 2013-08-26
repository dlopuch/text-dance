define(["jquery"], function($) {

  var data = $.Deferred();

  d3.tsv('data/texts.tsv',
    function(d) {
      // Return just arrays instead of objects... 27k rows, so save some memory
      return [
        new Date(d.text_ts),
        d.s_r === "SNT",
        +d.num_chars,
        +d.num_words,
        +d.min_since_prev || -1
      ];
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

  var ret = data.promise();
  ret.schema = {
    TEXT_TS: 0,
    IS_SENT: 1,
    NUM_CHARS: 2,
    NUM_WORDS: 3,
    MIN_SINCE_PREV: 4
  };
  return ret;

});