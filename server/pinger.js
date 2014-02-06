Meteor.publish('intervals', function () {
  return Intervals.find({});
});

intervals = {};

Meteor.methods({
  'setInterval': function (clientId) {
    var i=0;
    Intervals.insert({clientId: clientId, createdAt: moment()._d });
    var interval = Meteor.setInterval(function () {
      i++;
      console.log(i + "\t(" + clientId + ")");

      Intervals.update({clientId: clientId}, {$set: {
          clientId: clientId,
          counter: i
        }
      })
    }, 1000);
    
    intervals[clientId] = interval;

  },

  'clearInterval': function (intervalId) {
    var interval = Intervals.findOne(intervalId);
    
    Meteor.clearInterval(intervals[interval.clientId]);
    delete intervals[interval.clientId];

    Intervals.remove(intervalId);
  }
});