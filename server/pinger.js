Meteor.publish('intervals', function () {
  return Intervals.find({});
});

var minuteInMilliseconds = 1000; // * 60;
intervals = {};


var callGA = function (clientId, isLastPing) {
  var interval = Intervals.findOne({clientId: clientId});
  var query = _.pick(interval, ['tid', 'ec', 'ea']);
  query = _.extend(query, {
    cid: interval.clientId,
    t: 'event',
    ni: '1',
    v: '1'
  });

  if (isLastPing) {
    query["cd" + interval.cdIndex] = interval.cdValue;
  }

  // console.log('SIMULATE -- ' + moment().format('YYYY-MM-DD (HH:mm)') +  ': queried successfully.');
  // console.log(query);
  // console.log('\n');

  HTTP.get('http://www.google-analytics.com/collect', {
    params: query
  }, function (error, result) {
    if (error)
      console.log(error);
    else {
      console.log(moment().format('YYYY-MM-DD (HH:mm)') +  ': queried successfully.');
      console.log(query);
      console.log('\n');
    }
  });
};

var startInterval = function (params) {
  var milliseconds = params.interval * minuteInMilliseconds; 
  var i = params.counter || 0;
  var intervalHandler = Meteor.setInterval(function () {
    i++;
    Intervals.update({clientId: params.clientId}, {$set: {
        counter: i,
        updatedAt: moment()._d
      }
    });

    if (params.active) {
      callGA(params.clientId);
    }

  }, milliseconds);
  
  intervals[params.clientId] = intervalHandler;
};

Meteor.methods({
  'setInterval': function (interval) {
    var now = moment();
    
    // Adding a new interval
    if (Intervals.find({clientId: interval.clientId}).count() === 0) {

      console.log(interval.clientId + ', was inserted');

      Intervals.insert(_.extend(interval, {
        createdAt: now._d
      }));
    
      startInterval(interval); 

    // On startup, restart an interval
    } else {
      var lastPing = moment(interval.updatedAt || interval.createdAt); //Last ping, or has not yet pinged
      var millisecondsToNow = now.diff(lastPing);
      var catchupDelay = millisecondsToNow % (interval.interval * minuteInMilliseconds) // Wait the remainder 
      console.log(interval.clientId + ', delay with ' + catchupDelay/1000 + ' seconds');

      Meteor.setTimeout(function () { 

        // When delay has run, count up 1 
        interval.counter = (interval.counter) ? (interval.counter+1) : 1;

        console.log(interval.clientId + ', updating count to ' + interval.counter);
        Intervals.update({clientId: interval.clientId}, {$set: {
            counter: interval.counter,
            updatedAt: moment()._d
          }
        });

        if (interval.active) {
          callGA(interval.clientId);
        }

        console.log(interval.clientId + ', starting interval with ' + interval.interval + ' minutes');
        
        // And start the interval
        startInterval(Intervals.findOne({clientId: interval.clientId})); 
      }, catchupDelay);
    }  
  },

  'clearInterval': function (intervalId) {
    var interval = Intervals.findOne(intervalId);
    
    Meteor.clearInterval(intervals[interval.clientId]);
    delete intervals[interval.clientId];

    // Make final call to GA with custom dimension
    callGA(interval.clientId, interval.active);

    Intervals.remove(intervalId);
  },

  'toggleActive': function (intervalId, toggle) {
    Intervals.update(intervalId, {$set: {active: toggle}});
  }
});


// Continue counting for existing intervals
Meteor.startup(function () {
  Intervals.find().forEach(function (interval) {
    Meteor.call('setInterval', interval);
  });
});




