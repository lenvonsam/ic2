// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ionic-toast', 'starter.controllers', 'starter.services', 'starter.directives'])

.run(function($ionicPlatform, $rootScope, $state, leanHelper) {

  $ionicPlatform.ready(function() {
    // init AV Component
    AV.init({
      appId: 'myhzAUJyjkNOxkmzaX0iig0L-gzGzoHsz',
      appKey: '5GWcH5ixKnQgsITkHrfDTdKe'
    });
    $rootScope.currentUser = {};
    $rootScope.realtime = {};
    if (AV.User.current() == null || AV.User.current() == undefined) {
      $rootScope.currentUser = AV.User.current();
      $state.go('login');
    } else {
      $state.go('tab.chats');
    }
    $rootScope.realtime = new AV.Realtime({
      appId: 'myhzAUJyjkNOxkmzaX0iig0L-gzGzoHsz',
      region: 'cn', // 美国节点为 "us"
      plugins: [AV.TypedMessagePlugin],
      ssl: false
    });

    if ($rootScope.realtime) {
      leanHelper.initRealtimeObj($rootScope.realtime);
      $rootScope.realtime.on('disconnect', function() {
        console.log('网络连接已断开');
        alert('网络连接已断开');
      });

      $rootScope.realtime.on('schedule', function(attempt, delay) {
        console.log(delay + 'ms 后进行第' + (attempt + 1) + '次重连');
        alert(delay + 'ms 后进行第' + (attempt + 1) + '次重连');
      });
      $rootScope.realtime.on('retry', function(attempt) {
        console.log('正在进行第' + attempt + '次重连');
        alert('正在进行第' + attempt + '次重连');
      });
      $rootScope.realtime.on('reconnect', function() {
        console.log('网络连接已恢复');
        alert('网络连接已恢复');
      });
    }
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      alert(JSON.stringify(cordova));
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
      // StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $ionicConfigProvider, $urlRouterProvider) {
  $ionicConfigProvider.platform.ios.tabs.style('standard');
  $ionicConfigProvider.platform.ios.tabs.position('bottom');
  $ionicConfigProvider.platform.android.tabs.style('standard');
  $ionicConfigProvider.platform.android.tabs.position('standard');

  $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
  $ionicConfigProvider.platform.android.navBar.alignTitle('center');
  $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
  $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

  $ionicConfigProvider.platform.ios.views.transition('ios');
  $ionicConfigProvider.platform.android.views.transition('android');

  $ionicConfigProvider.backButton.text("");
  $ionicConfigProvider.backButton.previousTitleText(false);

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js

  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'

    })
    .state('register', {
      url: '/register',
      templateUrl: 'templates/register.html'
    })


  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:
  .state('tab.moments', {
    url: '/moments',
    views: {
      'tab-moments': {
        templateUrl: 'templates/tab-moments.html'
      }
    }
  })

  .state('tab.daily', {
    url: '/daily',
    views: {
      'tab-daily': {
        templateUrl: 'templates/tab-daily.html'
      }
    }
  })

  .state('tab.contacts', {
    url: '/contacts',
    views: {
      'tab-contacts': {
        templateUrl: 'templates/tab-contacts.html'
          // controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('tab.account-setting', {
    url: '/account/setting',
    views: {
      'tab-account': {
        templateUrl: 'templates/setting-list.html',
        controller: 'settingCtrl'
      }
    }
  })

  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});