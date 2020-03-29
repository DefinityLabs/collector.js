function Collector() {
  const collector = {};
  let done = undefined;
  let count = 0;

  function triggerDone() {
    if (count === 0) {
      throw new Error("Nothing has been triggered");
    }

    const responseCount = Object.keys(collector).length;
    if (done && count === responseCount) {
      done(collector);
    }
  }

  const callback = (name, err, data) => {
    collector[name] = { err: err, data: data };
    triggerDone();
  };

  return {
    trigger: function(name, fnc) {
      count++;

      try {
        fnc((err, data) => callback(name, err, data));
      } catch (e) {
        callback(name, e);
      }
    },

    done: function(callback) {
      done = callback;
      triggerDone();
    }
  };
}

Collector.all = function(array, callback) {
  let response = new Array(array.length);

  let count = 0;

  array.forEach((fnc, index) => {
    fnc(function() {
      response[index] = arguments;
      count++;

      if (count === array.length) {
        callback(response);
      }
    });
  });
};

Collector.sequence = function(array, callback) {
  Collector.all(array, function(values) {
    values.forEach(args => callback.apply(null, args));
  });
};

Collector.exec = function(fnc, previous) {
  let prev = previous;

  return {
    then: function(next) {
      return Collector.exec(next, this);
    },
    done: function(callback) {
      if (prev) {
        prev.done(function() {
          if (arguments[0]) {
            callback(arguments[0]);
            return;
          }

          delete arguments[0];

          let count = 0;
          Object.keys(arguments).forEach(key => {
            arguments[parseInt(key) - 1] = arguments[key];
            count++;
          });

          arguments[count] = callback;
          fnc.apply(null, arguments);
        });
      } else {
        fnc(callback);
      }
    }
  };
};

module.exports = Collector;
