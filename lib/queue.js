/**
 * Queue.js: https://github.com/mbostock/queue
 * This version is modified from original and awaiting pull request inclusion
 *     https://github.com/mbostock/queue/pull/5

 Copyright (c) 2012, Michael Bostock
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.
The name Michael Bostock may not be used to endorse or promote products
derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function() {
  if (typeof module === "undefined") self.queue = queue;
  else module.exports = queue;

  queue.version = "1.0.0";

  function queue(parallelism) {
    var queue = {},
        active = 0, // number of in-flight deferrals
        remaining = 0, // number of deferrals remaining
        head, tail, // singly-linked list of deferrals
        error = null,
        results = [],
        await = [],
        awaitAll = [];

    if (arguments.length < 1) parallelism = Infinity;

    queue.defer = function() {
      if (!error) {
        var node = arguments;
        node.index = results.push(undefined) - 1;
        if (tail) tail.next = node, tail = tail.next;
        else head = tail = node;
        ++remaining;
        pop();
      }
      return queue;
    };

    queue.await = function(f) {
      await.push(f);
      if (!remaining) notifyAwait(f);
      return queue;
    };

    queue.awaitAll = function(f) {
      if (!remaining) notifyAwaitAll(f);
      awaitAll.push(f);
      return queue;
    };

    function pop() {
      if (head && active < parallelism) {
        var node = head,
            f = node[0],
            a = Array.prototype.slice.call(node, 1),
            i = node.index;
        if (head === tail) head = tail = null;
        else head = head.next;
        ++active;
        a.push(function(e, r) {
          --active;
          if (error != null) return;
          if (e != null) {
            // clearing remaining cancels subsequent callbacks
            // clearing head stops queued tasks from being executed
            // setting error ignores subsequent calls to defer
            error = e;
            remaining = results = head = tail = null;
            notify();
          } else {
            results[i] = r;
            if (--remaining) pop();
            else notify();
          }
        });
        f.apply(null, a);
      }
    }

    function notify() {
      notifyType(await, notifyAwait);
      notifyType(awaitAll, notifyAwaitAll);
    }

    function notifyType(arr, func) {
      var length = arr.length;
      for (var i=0; i<length; i++) {
        func(arr[i]);
      }
    }

    function notifyAwait(callback) {
      callback.apply(null, error ? [error] : [null].concat(results));
    }

    function notifyAwaitAll(callback) {
      callback(error, error ? undefined : results);
    }

    return queue;
  }
})();
