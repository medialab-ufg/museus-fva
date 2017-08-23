"use strict";

var fvaAdmin = angular.module('ng.fva-admin', ['']);

fvaAdmin.controller('admController', ['$scope', '$state', function($scope, $state){
    $scope.message = 'foi!';
}]);