define(["jquery", "backbone"], function($, Backbone) {
  return Backbone.View.extend({
    initialize: function() {
      this.svg = d3.select(this.el).append("svg")
      .attr("width", 700)
      .attr("height", 400);

      this.plotArea = this.svg.append("g");

    },

    /**
     *
     * @param {Array(Conversation)} conversations List of conversations from the ConversationCrawler
     * @param {Object} options
     *   [colorScale]: {d3.scale(conversation)} Scale function that given a conversation, spits out color for it
     */
    render: function(conversations, options) {
      if (!conversations)
        return this;

      if (!options)
        options = {};

      var scales = this.scales = {
        x: d3.scale.linear()
           .domain([0, d3.max(conversations, function(d) {return d.durationMinutes;})])
           .range([0, 700]),
        y: d3.scale.linear()
           .domain([0, d3.max(conversations, function(d) {
             return (d.totalSent || 0) + (d.totalReceived || 0);
           })])
           .range([380, 0]) // reverse range b/c SVG y is descending.  380 to leave 20px left for scale at bottom
      };

      var d = this.plotArea.selectAll("circle").data(conversations);

      // enter new elements
      d.enter().append("circle");

      // update everything
      d
      .attr('r', options.r || 2)
      .attr("cx", function(d) { return scales.x(d.durationMinutes); })
      .attr("cy", function(d) { return scales.y(d.totalSent + d.totalReceived); })
      .attr('fill', function(d) {
        if (!options.colorScale)
          return "steelblue";

        return options.colorScale(d);
      })

      return this;
    }
  });
});