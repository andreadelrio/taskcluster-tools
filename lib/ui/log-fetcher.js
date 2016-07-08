module.exports = function (self) {
  var request;
  var dataOffset = 0;
  var ansiRegex = require('ansi-regex');
  var _ = require('lodash/lodash');

  function divide(data) {
    let tester = ansiRegex();
    let matcher = /.{1,139}/g;
    const separators = _
     .range(0,30)
     .map(i => '\\[' + i + 'B')
     .concat(['\\\n', '\\[K'])

    return data
      .split(new RegExp(separators.join('|'), 'g'))
      .reduce((arr, line) => {
        if (tester.test(line)) {
        // if (line.length < 140 || tester.test(line)) {
        // if (tester.test(line)) {
          arr.push(line + "$$$$ " + " ansi?" + tester.test(line));
        // } else if (line.length >= 139) {
        } else {
          // line = line + "@@@@";
          arr.push(line + "@@@@ " + " ansi?" + tester.test(line));
          // arr.push(...line.match(matcher));
          // arr.push(line);
        // }
        // if (line.length > 140) {
        //   console.log(line,line.length)
        // }  
        // } else {
          // arr.push(...line.match(matcher));
        }

        return arr;
      }, []);
  }

  function onData(e) {
    var resp = {};
    if (request.responseText != null) {
      // Check if we have new data
      var length = request.responseText.length;
      if (length > dataOffset) {
        resp.data = divide(request.responseText);
        resp.done = false;
      }
    }
    // When request is done
    if (request.readyState === request.DONE) {
      resp.done = true;
      // Write an error, if request failed
      if (request.status !== 200) {
        resp.data = ["\r\n[task-inspector] Failed to fetch log!\r\n"];
      } else {
        resp.data = divide(request.responseText);
      }
    }
    postMessage(resp);
    if (resp.done) {
      close();
    } 
  }

  function abort() {
    request.removeEventListener('progress', onData);
    request.removeEventListener('load', onData);
    request.abort();
    close();
  }

  self.addEventListener('message', function(e) {
    if (e.data.url) {
      request = new XMLHttpRequest();
      request.open('get', e.data.url, true);
      request.addEventListener('loadstart', onData);
      request.addEventListener('progress', onData);
      request.addEventListener('load', onData);
      request.send();
    };
    if (e.data.abort) {
      abort();
    } 
  });
 };
