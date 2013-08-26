define(["jquery", "backbone"], function($, Backbone) {
  var FULL_HEIGHT = 700,
      PLOT_HEIGHT = FULL_HEIGHT - 20,
      FULL_WIDTH = 2000,
      PLOT_WIDTH = FULL_WIDTH;

  return Backbone.View.extend({

    events: {
      "mouseover g[class=plot-area] circle": "_hoverConversation",
      "mouseout g[class=plot-area] circle": "_fadeConversation",
    },

    initialize: function() {
      this.svg = d3.select(this.el).append("svg")
      .attr("width", FULL_WIDTH)
      .attr("height", FULL_HEIGHT);

      this.plotArea = this.svg.append("g").classed("plot-area", true);
      this.danceArea = this.svg.append("g").classed("dance-area", true);

      this._dancesCache = {};

    },

    _hoverConversation: function(e) {
      // debounce
      if (this._lastHoverConversation === e.target.__data__)
        return;
      this._lastHoverConversation = e.target.__data__;

      console.log("HEYDAN! Hovered over a conversation", e.target);
      window.hdE = e.target;
      this.renderDance(e.target.__data__);
    },

    _fadeConversation: function(e) {
      if (!this._activeDance)
        return;

      this._activeDance.selectAll("line")
      .transition()
      .delay(function(d, i) {return i * 5;})
      .duration(1000)
      .attr({
        stroke: "grey",
        strokeWidth: 1,
        opacity: 0.2
      });

      //delete this._activeDance;
    },


    renderDance: function(conversation, options) {
      if (this._dancesCache[conversation.id])
        return;

      var prevX = [0, 0], // in minutes   (0: sent, 1: received)
          prevY = [0, 0], // reply number
          cumY = 0,
          t0 = conversation.texts[0].timestamp;

      // Check if we need to delete and remove old selected conversations
      if (this.danceArea.selectAll("g").size() > 10) {
        delete this._dancesCache[this.danceArea.select("g").datum().id];
        this.danceArea.select("g").remove();
      }

      var dance = this.danceArea.append("g").classed("convo-" + conversation.id, true),
          scales = this.scales;

      dance.data([conversation]);
      this._dancesCache[conversation.id] = this._activeDance = dance;

      dance.selectAll("line").data( conversation.texts )
      .enter().append("line")
      .each(function(txt) {
        var attrs = {
          x1: prevX[ txt.isSent ? 0 : 1 ],
          y1: prevY[ txt.isSent ? 0 : 1 ],
          x2: (txt.timestamp - t0) / 1000 / 60,
          y2: ++ cumY
        };
        prevX[ txt.isSent ? 0 : 1 ] = attrs.x2;
        prevY[ txt.isSent ? 0 : 1 ] = attrs.y2;

        // Map them to the coordinate system
        attrs = {
          x1: scales.x(attrs.x1),
          x2: scales.x(attrs.x2),
          y1: scales.y(attrs.y1),
          y2: scales.y(attrs.y2),

          stroke: txt.isSent ? "steelblue" : "red",
          strokeWidth: 2,
          opacity: 0.0
        };

        d3.select(this).attr(attrs);
      })
      .transition()
      .delay(function(d, i) {return i;})
      .duration(250)
      .attr("opacity", 1.0);

    },

    /**
     * Given a data array of conversations, renders all the dots for them with duration in minutes on the x and
     * number of back-and-forths on the y.
     *
     * @param {Array(Conversation)} conversations List of conversations from the ConversationCrawler
     * @param {Object} options
     *   [colorScale]: {d3.scale(conversation)} Scale function that given a conversation, spits out color for it (may need an extractor wrapper around the d3.scale)
     */
    render: function(conversations, options) {
      if (!conversations)
        return this;

      if (!options)
        options = {};

      var scales = this.scales = {
        x: d3.scale.linear()
           .domain([0, d3.max(conversations, function(d) {return d.durationMinutes;})])
           .range([0, PLOT_WIDTH]),
        y: d3.scale.linear()
           .domain([0, d3.max(conversations, function(d) {
             return (d.totalSent || 0) + (d.totalReceived || 0);
           })])
           .range([PLOT_HEIGHT, 0]) // reverse range b/c SVG y is descending.  380 to leave 20px left for scale at bottom
      };

      var d = this.plotArea.selectAll("circle").data(conversations);

      // enter new elements
      d.enter().append("circle");

      // update everything
      d
      .attr('r', options.r || 2)
      .attr("cx", function(d) { return scales.x(d.durationMinutes); })
      .attr("cy", function(d) { return scales.y(d.totalSent + d.totalReceived); })
      .attr('fill', function(d) { return options.colorScale ? options.colorScale(d) : "steelblue"; });

      return this;
    }
  });
});