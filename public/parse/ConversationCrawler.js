define(["jquery", "parse/ImportAndParse"], function($, ImportAndParse) {

  /** Number of minutes since previous text before it's considered a new conversation */
  var MAX_CONVERSATION_CUTOFF = 60;

  var S = ImportAndParse.schema;

  /**
   * Crawler that crawls through text message rows (from ImportAndParse.js) and converts each into a conversation.
   * @param {Array} texts List of texts from ImportAndParse.  We assume they're in time-ascending order.
   * @returns {Array(Object)} Returns a list of conversations, where each "conversation" is an Object:
   *   texts: {Array(text)} Texts part of that conversation
   *   durationMinutes: {Number} Duration of the conversation in minutes
   *   totalNumChars: {Number}
   *   totalNumWords: {Number}
   *   totalSent: {Number}
   *   totalReceived: {Number}
   */
  return function(texts) {
    var conversations = [],
        convo = [],
        id = 0;
    for (var i=0; i < texts.length; i++) {
      if (texts[i].minSincePrev > MAX_CONVERSATION_CUTOFF) {

        var stats = {
          id: ++id,
          totalNumChars: 0,
          totalNumWords: 0,
          totalSent: 0,
          totalReceived: 0
        };

        convo.map(function(txt) {
          stats.totalNumChars += txt.numChars;
          stats.totalNumWords += txt.numWords;
          stats.totalSent     += (txt.isSent ? 1 : 0);
          stats.totalReceived += (txt.isSent ? 0 : 1);
        });

        stats.durationMinutes = Math.round( (convo[convo.length - 1].timestamp - convo[0].timestamp) / 1000 / 60 );
        stats.texts = convo;

        conversations.push(stats);
        convo = [texts[i]];
      } else {
        convo.push(texts[i]);
      }
    }

    return conversations;
  }
});