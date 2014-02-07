Meteor.publish('intervals', function () {
  return Intervals.find({});
});

intervals = {};

var gaParams = function (params) {

}

Meteor.methods({
  'setInterval': function (params) {
    var milliseconds = params.interval * 60 * 1000;

    var i=0;
    Intervals.insert(_.extend(params, {
      createdAt: moment()._d 
    }));

    var intervalHandler = Meteor.setInterval(function () {
      i++;
      Intervals.update({clientId: params.clientId}, {$set: {
          counter: i,
          updatedAt: moment()._d
        }
      })
    }, milliseconds);
    
    intervals[params.clientId] = intervalHandler;

  },

  'clearInterval': function (intervalId) {
    var interval = Intervals.findOne(intervalId);
    
    Meteor.clearInterval(intervals[interval.clientId]);
    delete intervals[interval.clientId];

    Intervals.remove(intervalId);
  }
});