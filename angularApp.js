angular.module('AuthApp', ['uiGmapgoogle-maps'])
    .config(function(uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            //    key: 'your api key',
            v: '3.20', //defaults to latest 3.X anyhow
            libraries: 'weather,geometry,visualization'
        });
    })
    .controller('mainCtrl', function ($scope, $log, $interval,uiGmapGoogleMapApi) {
        $scope.scenario = 'Log in';
        $scope.currentUser = Parse.User.current();
        console.log($scope.currentUser);
        var stoptime;
        $scope.clicked=false;
        $scope.intervalfunction = function(){
            $scope.interval =  $interval(function(){
                $scope.fetchmarkers();
             },5000)};
        $scope.signUp = function(form) {
            var user = new Parse.User();
            user.set("email", form.email);
            user.set("username", form.username);
            user.set("password", form.password);

            user.signUp(null, {
                success: function(user) {
                    $scope.currentUser = user;
                    $scope.$apply();

                },
                error: function(user, error) {
                    alert("Unable to sign up:  " + error.code + " " + error.message);
                }
            });
        };

        $scope.logIn = function(form) {
            Parse.User.logIn(form.username, form.password, {
                success: function(user) {
                    $scope.currentUser=user;
                    $scope.fetchmarkers();
                    $scope.intervalfunction();


                },
                error: function(user, error) {
                    alert("Unable to log in: " + error.code + " " + error.message);
                }
            });
        };
        $scope.fetchmarkers = function(){
    // User's location
    var userGeoPoint = $scope.currentUser.get("location");
// Create a query for places
    var query = new Parse.Query("PlaceObject");
// Interested in locations near user.
    query.near("location", userGeoPoint);
// Limit what could be a lot of points.
    query.limit(100);
// Final list of objects
    query.find({
        success: function(placesObjects) {
            $scope.places = placesObjects;
            var i =0;
            $scope.markers=[];
            angular.forEach($scope.places, function(place){
                var location = place.get("location");
                console.log(location.latitude + "  "+ location.longitude);
                $scope.markers.push(createMarker(i,location.latitude,location.longitude))
                i++;
                $scope.$apply();
            });

        }
    });
}

        $scope.logOut = function(form) {
            Parse.User.logOut();
            $scope.currentUser = null;
            $interval.cancel($scope.interval);
            $scope.markers=[];
        };
        if($scope.currentUser!=null)
        {
            $scope.fetchmarkers();
            $scope.intervalfunction();
        }
        $scope.markers=[];
        var createMarker = function(i, latitude,longitude, idKey) {


            if (idKey == null) {
                idKey = "id";
            }


            var ret = {
                latitude: latitude,
                longitude: longitude,
                title: 'm' + i
            };
            ret[idKey] = i;
            return ret;
        };
        $scope.coordsUpdates = 0;
        $scope.dynamicMoveCtr = 0;
        $scope.options = {scrollwheel: false};


        $scope.map = {center: {latitude: 31.928508, longitude: 34.798336 }, zoom: 12 };
        console.log($scope.marker);


        $scope.showmarker = function (marker1,eventname,exactmodel) {
           // alert("baby at "+ exactmodel.latitude+ "  "+ exactmodel.longitude);
            $scope.clicked=true;
            $scope.currentmodel=exactmodel;
           // console.log(exactmodel);
        };

        $scope.deletemarker= function(markertodelete){

            var query = new Parse.Query("PlaceObject");
            query.find({
                success: function(placesObjects) {

                    angular.forEach(placesObjects, function(place){
                        var location = place.get("location");
                        if((markertodelete.latitude==location.latitude)&&(markertodelete.longitude==location.longitude))
                        {
                            place.destroy({});
                            $scope.clicked = false;
                            $scope.fetchmarkers();
                        }

                    });

                }
            });

        };
        $scope.circles = [
            {
                id: 1,
                center: {
                    latitude: 40.1451,
                    longitude: -99.6680
                },
                radius: 50,
                stroke: {
                    color: '#08B21F',
                    weight: 2,
                    opacity: 1
                },
                fill: {
                    color: '#08B21F',
                    opacity: 0.5
                },
                geodesic: true, // optional: defaults to false
                draggable: true, // optional: defaults to false
                clickable: true, // optional: defaults to true
                editable: true, // optional: defaults to false
                visible: true, // optional: defaults to true
                control: {}
            }
        ];

    });
