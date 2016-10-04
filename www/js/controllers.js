angular.module('starter.controllers', [])
  .filter('getChatListLabelName', function() {
    return function(memberArr, avClientId) {
      var result = "";
      for (var i = 0; i < memberArr.length; i++) {
        if (avClientId != memberArr[i]) {
          result = memberArr[i];
        }
      }
      return result;
    }
  })
  .filter('showLastChatMsgContent', function() {
    return function(msgObj) {
      console.log(msgObj);
      if (msgObj == undefined) {
        return "";
      } else {
        // switch(msgObj.)
        return "12";
      }
    }
  })
  .filter('chatDetailFrom', function() {
    return function(msgObj, avClientId, msgType) {
      console.log('avClientId>>>>' + avClientId + ";msgType:>>" + msgType);
      switch (msgType) {
        case 'text':
          if (msgObj.type == -1 && avClientId == msgObj.from) {
            return true;
          } else {
            return false
          }
          break;
        default:
          return false;
          break;
      }
    }
  })
  .filter('chatDetailTo', function() {
    return function(msgObj, avClientId, msgType) {
      switch (msgType) {
        case 'text':
          if (msgObj.type == -1 && avClientId != msgObj.from) {
            return true;
          } else {
            return false
          }
          break;
        default:
          return false;
          break;
      }
    }
  })

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, $state, Chats, leanHelper, $ionicPopover, samHelper) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  $scope.ischatListShow = false;
  $scope.emptyChatList = true;
  $scope.$on('$ionicView.beforeEnter', function() {
    console.log('chart list ----loading');

  });
  $scope.$on('$ionicView.afterEnter', function() {
    $scope.currentClient = leanHelper.getAVClient();
    leanHelper.queryConversations({
      success: function(convs) {
        samHelper.hideLoading();
        console.log(convs);
        if (convs.length > 0) {
          console.log('gt0');
          $scope.chats = convs;
          $scope.ischatListShow = true;
          $scope.emptyChatList = false;
        }
      },
      error: function(err) {
        samHelper.hideLoading();
        console.log(err);
      }
    });
  });

  $ionicPopover.fromTemplateUrl('templates/chat-add-popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.chatAddBtn = function($event) {
    $scope.popover.show($event);

  };
  $scope.closePopover = function(id) {
    console.log(id);
    //测试创建房间
    leanHelper.createSingleRoom({
      targetName: 'Tom',
      success: function() {
        alert('房间创建成功');
        $scope.popover.hide();
        $state.go('tab.chats');
      },
      error: function(err) {
        console.log();
      }
    });
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });

  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, $ionicTabsDelegate, leanHelper, samHelper, $ionicScrollDelegate) {

    $scope.$on('$ionicView.beforeEnter', function() {
      $ionicTabsDelegate.showBar(false);
      samHelper.loadingMsg();
    });

    $scope.scrollToBottom = function() {
      $ionicScrollDelegate.$getByHandle('chatDetailScroll').scrollBottom(true);
    }

    $scope.$on('$ionicView.afterEnter', function() {
      leanHelper.getConversationById({
        convId: $stateParams.chatId,
        success: function(chat) {
          $scope.chat = chat;
          // console.log($scope.chat);
          // console.log($scope.chat._attributes.type);
          if (chat._attributes.type == "private") {
            $scope.chatName = chat.members[1];
            console.log($scope.chatName);
          } else {

          }
          // chatClient =
          //获取历史数据
          leanHelper.getQueryChatMessagesByConv({
            conv: chat,
            success: function(ms) {
              samHelper.hideLoading();
              $scope.chatMsgs = ms;
              $scope.currentClient = leanHelper.getAVClient();
              $scope.currentClient.on('message', function(message, converstaion) {
                if ($scope.chat.id == converstaion.id) {
                  alert('收到消息');
                  $scope.$broadcast('newChatMsg', message);
                }
              });
              $scope.scrollToBottom();
            },
            error: function(err) {
              alert('error:>>' + JSON.stringify(err));
              samHelper.hideLoading();
              console.log('err>>>' + JSON.stringify(err));
            }
          });
        },
        error: function(err) {
          console.log(err);
        }
      });
    });
    $scope.isChatInput = true;
    $scope.isChatVoice = false;
    $scope.$on('$ionicView.beforeLeave', function() {
      $ionicTabsDelegate.showBar(true);
    });
    $scope.$on('newChatMsg', function(e, d) {
      $scope.chatMsgs.push(d);
      $scope.$digest();
      $scope.scrollToBottom();
    });
    $scope.keyEnter = function(e) {
      if (e.keyCode == 13) {
        var enterVal = e.target.value;
        if (enterVal.trim().length > 0) {
          //发送消息
          leanHelper.sendChatMsg({
            type: 'text',
            content: enterVal,
            success: function(msg) {
              console.log('chatMsg.length before:>>' + $scope.chatMsgs.length);
              $scope.chatMsgs.push(msg);
              console.log('chatMsg.length after:>.' + $scope.chatMsgs.length);
              console.log('msgInput>>>>>>>>' + $scope.msgInput);
              document.getElementById('chatDetailIpt').value = "";
              $scope.$digest();
              $scope.scrollToBottom();
              samHelper.hideKeyBoard();
            },
            error: function(err) {
              alert('err');
            }
          })
        } else {
          samHelper.errMsg('消息不能为空');
          return;
        }
      }
    }


    window.addEventListener("native.keyboardshow", function(e) {
      alert('navtive keyboardshow');
      $scope.scrollToBottom();
    });

    $scope.micClick = function() {
      if ($scope.isChatInput) {
        $scope.isChatInput = false;
        $scope.isChatVoice = true;
      } else {
        $scope.isChatInput = true;
        $scope.isChatVoice = false;
      }
    }

  })
  .controller('chatDetailRepeatCtrl', function($scope) {
    $scope.$watch('msg.id', function(newValue) {
      alert('监听到有变化');
      console.log('chatMsgs change');
      console.log(newValue);
      $scope.scrollToBottom();
    });
  })
  .controller('loginCtrl', function($scope, $state, $ionicTabsDelegate, ionicToast, loginService, samHelper, leanHelper) {
    $scope.username = "";
    $scope.userpwd = "";
    $scope.$on('$ionicView.beforeEnter', function() {
      $ionicTabsDelegate.showBar(false);
    });
    $scope.$on('$ionicView.beforeLeave', function() {
      $ionicTabsDelegate.showBar(true);
    });
    $scope.loginAction = function() {
      /**
      params info:
      position:top,middle,bottom
      isCloseAuto
      time
      */
      // ionicToast.show('This is a toast at the top.', 'middle', false, 2500);
      if (this.username.trim().length == "") {
        samHelper.errMsg('手机号不能为空');
        return;
      } else if (this.userpwd.trim().length == "") {
        samHelper.errMsg('密码不能为空');
        return;
      } else {
        loginService.loginWithMobile({
          username: this.username,
          userpwd: this.userpwd,
          success: function() {
            $scope.currentUser = AV.User.current();
            var clientName = $scope.currentUser.getUsername();
            samHelper.loadingMsg();
            leanHelper.createAVClient({
              clientName: clientName,
              success: function(ct) {
                leanHelper.initAVClient(ct);
                samHelper.hideKeyBoard();
                $state.go('tab.chats');
              },
              error: function(err) {
                console.log(err);
                alert('error:>>>' + JSON.stringify(err));
              }
            });
          },
          error: function(err) {
            var errMsg = "";
            samHelper.errMsg(loginService.errorHandler(err.code));
          }
        });

      }
    };
  })

.controller('AccountCtrl', function($scope) {

    $scope.settings = {
      enableFriends: true
    };
  })
  .controller('settingCtrl', function($scope, $state, $ionicTabsDelegate, $ionicHistory) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $ionicTabsDelegate.showBar(false);
    });
    $scope.$on('$ionicView.beforeLeave', function() {
      $ionicHistory.clearHistory();
      $ionicTabsDelegate.showBar(true);
      AV.User.logOut();
    });

  });