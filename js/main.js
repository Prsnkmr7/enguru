enguruBuild = angular.module('enguru-app', ['ui.router']);

// Route Provider Starts

enguruBuild.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider

        .state('Home', {
            url: '/',
            templateUrl: 'Templates/home.html'
        })
        .state('item', {
            url: '/item',
            templateUrl: 'Templates/item.html'
        })

});

// Home Controller logic

enguruBuild.controller('homeController', ['$scope', 'enguruAPIservice', '$state', '$rootScope', function ($scope, enguru, $state, $rootscope) {
    $scope.orderByField = 'currentBid';
    $scope.reverseSort = false;
    enguru.listAllItems().success(function (response) {
        $scope.listItems = response;
        categoriesData(response);
    });

    var categoriesData = function (data) {
        var currentDate = moment();
        angular.forEach(data, function (value, key) {
            if (moment(value.endTime).isAfter(currentDate)) {
                value.auction = 'Upcoming'
            } else if (moment(value.startTime).isBefore(currentDate + 1)) {
                value.auction = 'Past'
            } else {
                value.auction = 'Current'
            }
        });
    };

    $scope.sort = function (order, val) {
        $scope.orderByField = val;
        $scope.reverseSort = order;
    };

    $scope.gotoListPage = function (val) {
        $rootscope.listId = val;
        $state.go('item');
    }

}]);

// List Controller Logic

enguruBuild.controller('listController', ['$scope', 'enguruAPIservice', '$state', '$rootScope', function ($scope, enguru, $state, $rootscope) {
    $scope.showBidding = false;
    $scope.showAuction = false;
    $scope.user = {};
    enguru.fetchItem($rootscope.listId).success(function (response) {
        $scope.itemList = response;
        $scope.itemList.endDateFormat = moment($scope.itemList.endTime).format('DD MMM YYYY');
    });

    $scope.submitForm = function (val) {
        if (val) {
            var payload = {
                "name": $scope.user.name,
                "email": $scope.user.email,
                "bidAmount": $scope.user.bidAmount
            };
            enguru.postAbid(payload, $rootscope.listId).success(function (response) {
                $scope.showBidding = false;
            });
        }
    };

    $scope.submitAuctionForm = function (val) {
        if (val) {
            var payload = {
                "itemName": $scope.user.itemname,
                "itemDescription": $scope.user.itemdesc,
                "bidAmount": $scope.user.bidAmount,
                "startTime": "2018-03-18T09:18:32Z",
                "endTime": "2018-03-20T09:18:36Z",
                "bidAmount": $scope.user.aucbidAmount,
                "currentBid": $scope.user.currentBid,
                "itemImage": "https://images-na.ssl-images-amazon.com/images/I/61pNCtIdQUL.SY445_.jpg"

            };
            enguru.createAuction(payload).success(function (response) {
                $scope.showAuction = false;
            });
        }
    };

    $scope.toggleBidding = function (val) {
        $scope.showBidding = val;
    };

    $scope.toggleAuction = function (val) {
        $scope.showAuction = val;
    };


}]);


// Factories

enguruBuild.factory('enguruAPIservice', function ($http) {

    var enguruAPI = {};

    enguruAPI.listAllItems = function () {
        return $http({
            method: 'GET',
            url: 'http://arunreghunathan.pythonanywhere.com/auction/item'
        });
    }

    enguruAPI.fetchItem = function (id) {
        return $http({
            method: 'GET',
            url: 'http://arunreghunathan.pythonanywhere.com/auction/item/' + id
        });
    }

    enguruAPI.postAbid = function (payload, id) {
        return $http({
            method: 'PUT',
            url: 'http://arunreghunathan.pythonanywhere.com/auction/item/' + id + '/bid',
            data: payload
        });
    }

    enguruAPI.createAuction = function (payload) {
        return $http({
            method: 'POST',
            url: 'http://arunreghunathan.pythonanywhere.com/auction/item',
            data: payload
        });
    }

    return enguruAPI;
});