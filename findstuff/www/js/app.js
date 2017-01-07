angular.module('starter', ['ionic'])

.controller('AppCtrl', function($scope, $ionicPopup, $ionicModal) {
  // $scope.data = {
  //   speechText: ''
  // };
  // $scope.recognizedText = '';
  //
  // $scope.speakText = function() {
  //   TTS.speak({
  //          text: $scope.data.speechText,
  //          locale: 'en-GB',
  //          rate: 1.5
  //      }, function () {
  //          // Do Something after success
  //      }, function (reason) {
  //          // Handle the error case
  //      });
  // };
  //
  // $scope.record = function() {
  //   var recognition = new SpeechRecognition();
  //   recognition.onresult = function(event) {
  //       if (event.results.length > 0) {
  //           $scope.recognizedText = event.results[0][0].transcript;
  //           $scope.$apply();
  //       }
  //   };
  //   recognition.start();
  // };

  $scope.itemname = '';
  $scope.itemlocation = '';
  $scope.searcheditem = '';
  var trigger = false;

  $ionicModal.fromTemplateUrl('modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    firebase.database().ref(firebase.auth().currentUser.uid).on('value', function(snapshot) {
      var group = {};
      var i = 0;
      snapshot.forEach(function(childSnapshot) {
        var temp = {};
        temp.name = childSnapshot.key;
        temp.location = childSnapshot.val();
        group[i] = temp;
        i++;
      });
      $scope.group = group;
      $scope.modal.show();
    });
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.storeItemName = function() {
    var recognition = new SpeechRecognition();
      recognition.onresult = function(event) {
          if (event.results.length > 0) {
              $scope.itemname = event.results[0][0].transcript;
              $scope.$apply();
          }
      };
      recognition.start();
  };

  $scope.storeItemLocation = function() {
    var recognition = new SpeechRecognition();
      recognition.onresult = function(event) {
          if (event.results.length > 0) {
              $scope.itemlocation = event.results[0][0].transcript;
              $scope.$apply();
          }
      };
      recognition.start();
  };

  $scope.storeItem = function() {
    firebase.database().ref(firebase.auth().currentUser.uid + '/' + $scope.itemname).set($scope.itemlocation)
    .then(function() {
      $ionicPopup.alert({
        title: "Success",
        template: "Item Stored"
      });
      $scope.itemname = '';
      $scope.itemlocation = '';
      $scope.$apply();
    });
  };

  $scope.searchItem = function() {
    trigger = true;
    var recognition = new SpeechRecognition();
      recognition.onresult = function(event) {
          if (event.results.length > 0) {
              $scope.searcheditem = event.results[0][0].transcript;
              $scope.$apply();
              firebase.database().ref(firebase.auth().currentUser.uid + '/' + $scope.searcheditem).on('value', function(snapshot) {
                  if (trigger) {
                    if (snapshot.val()) {
                      TTS.speak({
                               text: snapshot.val(),
                               locale: 'en-GB',
                               rate: 1.5
                           }, function () {
                               // Do Something after success
                           }, function (reason) {
                               // Handle the error case
                           });
                      $ionicPopup.alert({
                        title: $scope.searcheditem,
                        template: snapshot.val()
                      });
                    } else {
                      TTS.speak({
                               text: 'Could not find item.',
                               locale: 'en-GB',
                               rate: 1.5
                           }, function () {
                               // Do Something after success
                           }, function (reason) {
                               // Handle the error case
                           });
                      $ionicPopup.alert({
                        title: $scope.searcheditem,
                        template: 'Could not find item.'
                      });
                    }
                    $scope.searcheditem = '';
                    $scope.$apply();
                    trigger = false;
                  }
              });
          }
      };
      recognition.start();
  };
})

.controller('loginCtrl', function($scope, $ionicPopup) {

  $scope.input = {};

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      window.location = "main.html";
    }
  });

  $scope.login = function(input) {
    if (!input.email || !input.password) {
      $ionicPopup.alert({
        title: "Login Error",
        template: "Fill out all fields."
      });
    } else {
      firebase.auth().signInWithEmailAndPassword(input.email, input.password)
        .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/wrong-password') {
          $ionicPopup.alert({
            title: "Login Error",
            template: "Wrong Password"
          });
        } else {
          firebase.auth().createUserWithEmailAndPassword(input.email, input.password)
            .then(function(user) {
              window.location = "main.html";
            })
            .catch(function(error2) {
            // Handle Errors here.
            var errorCode = error2.code;
            var errorMessage = error2.message;
            if (errorCode == 'auth/weak-password') {
              $ionicPopup.alert({
                title: "Login Error",
                template: "Password is too weak."
              });
            } else {
              $ionicPopup.alert({
                title: "Login Error",
                template: "Please try again."
              });
            }
            console.log(error);
          });
        }
      });
    }
  };
});
