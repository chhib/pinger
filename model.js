Intervals = new Meteor.Collection("intervals");

Intervals.allow({
  insert: function () {return true;},
  update: function () {return true;},
  remove: function () {return true;}
})