// function getRandomInt(min, max) {
//   min = Math.ceil(min);
//   max = Math.floor(max);
//   return Math.floor(Math.random() * (max - min)) + min;
// }

 // && (getRandomInt(0, 5) === 0)

angular.module('starter', ['ionic'])

.run(function($ionicPlatform, $ionicPopup) {
    $ionicPlatform.ready(function() {
        if(window.plugins && window.plugins.AdMob) {
          var admob_key = device.platform == "Android" ? "ca-app-pub-5667457276942129/3659768522" : "ca-app-pub-5667457276942129/9427100524";
          var admob = window.plugins.AdMob;
          admob.createBannerView(
              {
                  'publisherId': admob_key,
                  'adSize': admob.AD_SIZE.BANNER,
                  'bannerAtTop': false
              },
              function() {
                      admob.requestAd(
                          { 'isTesting': false },
                          function() {
                              admob.showAd(true);
                          },
                          function() { console.log('failed to request ad'); }
                      );
                  },
                function() { console.log('failed to create banner view'); }
          );
        }
    });
})

.config(function($ionicConfigProvider) {
  $ionicConfigProvider.navBar.alignTitle('center');
})

.controller('AppCtrl', function($scope, $ionicPopup, $ionicModal) {

  $scope.disp = {};
  $scope.disp.lay = false;
  setTimeout(function() {
    $scope.disp.lay = true;
    $scope.$apply();
  }, 500);
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
      $scope.$apply();
    });
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.textmode = function() {
    window.location = "text.html";
  };

  $scope.delete = function(name) {
    firebase.database().ref(firebase.auth().currentUser.uid + '/' + name).remove();
  };

  $scope.storeItemName = function() {
    var recognition = new SpeechRecognition();
      recognition.onresult = function(event) {
          if (event.results.length > 0) {
              $scope.itemname = event.results[0][0].transcript.toLowerCase();
              $scope.$apply();
          }
      };
      recognition.start();
  };

  $scope.storeItemLocation = function() {
    var recognition = new SpeechRecognition();
      recognition.onresult = function(event) {
          if (event.results.length > 0) {
              $scope.itemlocation = event.results[0][0].transcript.toLowerCase();
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
              $scope.searcheditem = event.results[0][0].transcript.toLowerCase();
              $scope.$apply();
              firebase.database().ref(firebase.auth().currentUser.uid + '/' + $scope.searcheditem).on('value', function(snapshot) {
                  if (trigger) {
                    if (snapshot.val()) {
                      TTS.speak({
                               text: snapshot.val(),
                               locale: 'en-US',
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
                               locale: 'en-US',
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

  $scope.logout = function() {
    firebase.auth().signOut().then(function() {
      window.location = "index.html";
    }, function(error) {
      // console.error('Sign Out Error', error);
    });
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
})

.controller('TextCtrl', function($scope, $ionicPopup, $ionicModal) {

  $scope.disp = {};
  $scope.disp.lay = false;
  setTimeout(function() {
    $scope.disp.lay = true;
    $scope.$apply();
  }, 500);

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

  $scope.item = {};
  $scope.search = {};
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
      $scope.$apply();
    });
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.speechmode = function() {
    window.location = "main.html";
  };

  $scope.delete = function(name) {
    firebase.database().ref(firebase.auth().currentUser.uid + '/' + name).remove();
  };

  $scope.storeItem = function(item) {
    $scope.itemname = item.itemname.toLowerCase();
    $scope.itemlocation = item.itemlocation.toLowerCase();
    firebase.database().ref(firebase.auth().currentUser.uid + '/' + $scope.itemname).set($scope.itemlocation)
    .then(function() {
      $ionicPopup.alert({
        title: "Success",
        template: "Item Stored"
      });
      $scope.itemname = '';
      $scope.itemlocation = '';
      $scope.item = {};
      $scope.$apply();
    });
  };

  $scope.searchItem = function(search) {
    $scope.searcheditem = search.searcheditem.toLowerCase();
    trigger = true;
    firebase.database().ref(firebase.auth().currentUser.uid + '/' + $scope.searcheditem).on('value', function(snapshot) {
        if (trigger) {
          if (snapshot.val()) {
            TTS.speak({
                     text: snapshot.val(),
                     locale: 'en-US',
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
                     locale: 'en-US',
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
          $scope.search = {};
          $scope.searcheditem = '';
          $scope.$apply();
          trigger = false;
        }
    });
  };

  $scope.logout = function() {
    firebase.auth().signOut().then(function() {
      window.location = "index.html";
    }, function(error) {
      // console.error('Sign Out Error', error);
    });
  };
});
