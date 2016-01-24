'use strict';

angular.module('reachability', [])
  .factory('Reachability', function($http, $interval, $location, $log) {
    var REFRESH_INTERVAL = 1000;
    var isOnline = false;

    var baseURI = $location.protocol() + "://" + $location.host() + ":" + $location.port();
    var storedURI = localStorage.getItem("crate.base_uri");
    if (storedURI) baseURI = storedURI;

    var setReachability = function(online) {
      isOnline = online;
    };

    var getReachability = function() {
      return isOnline;
    };

    var checkReachability = function(){
      $http.get(baseURI + "/").success(function(response) {
        var online = response && response.status === 200;
        setReachability(online);
      }).error(function(data, status) {
        setReachability(false);
      });
    };

    checkReachability();
    $interval(checkReachability, REFRESH_INTERVAL);

    return {
      reachable: getReachability
    };
  });
