angular.module('starter.services', [])
  .service('loginService', function() {
    this.errorHandler = function(errCode) {
      var msg = "";
      switch (errCode) {
        case 211:
          msg = "手机号或密码错误";
          break;
        case 1:
          msg = "登录失败次数超过限制，请稍候再试";
          break;
        default:
          msg = "登录失败";
          break;
      }
      return msg;
    };
    this.loginWithMobile = function(info) {
      AV.User.logInWithMobilePhone(info.username, info.userpwd).then(function(user) {
        info.success();
      }, (function(err) {
        info.error(err);
      }));
    }
  })

//samHelper
.service('samHelper', function($ionicLoading) {
  this.errMsg = function(msg) {
    $ionicLoading.show({
      template: msg,
      noBackdrop: true,
      duration: 2500
    })
  };

  this.loadingMsg = function() {
    $ionicLoading.show({
      template: '加载中...'
    });
  };

  this.hideLoading = function() {
    $ionicLoading.hide();
  };

  this.hideKeyBoard = function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      alert('has cordova');
      cordova.plugins.Keyboard.close();

    } else {
      alert('no cordova');
    }
  }

})

//leancloudHelper
.service('leanHelper', function() {
  var realtimeObj = null;
  var avClient = null;
  var currentConv = null;
  var messageIterator = null;
  this.initRealtimeObj = function(obj) {
    realtimeObj = obj;
  };
  this.getRealtimeObj = function() {
    return realtimeObj;
  }

  this.createAVClient = function(info) {
    realtimeObj.createIMClient(info.clientName).then(function(ct) {
      info.success(ct);
    }, function(err) {
      alert('createAVClient:>>' + err);
      info.error(err);
    });
  }

  this.initAVClient = function(ct) {
    avClient = ct;
  }

  this.createSingleRoom = function(info) {
    avClient.createConversation({
      members: [info.targetName],
      name: avClient.id + '-' + info.targetName,
      type: 'private'
    }).then(function(conv) {
      currentConv = conv;
      info.success();
    }, function(err) {
      info.error(err);
    })
  }

  this.getCurrentConverstaion = function() {
    return currentConv;
  }

  this.getAVClient = function() {
    return avClient;
  }

  this.getConversationById = function(info) {
    avClient.getConversation(info.convId).then(function(conv) {
      if (currentConv != null && currentConv.id != conv.id) {
        messageItterator = null;
      }
      currentConv = conv;
      info.success(conv);
    }, function(err) {
      alert(JSON.stringify(err));
      info.error();
    });
  }

  this.queryConversations = function(info) {
    console.log(avClient);
    if (avClient) {
      avClient.getQuery().containsMembers([avClient.id]).find().then(function(data) {
        info.success(data);
      }, function(err) {
        info.error(err);
      });
    }
  }

  this.getQueryChatMessagesByConv = function(info) {
    info.conv.queryMessages().then(function(msgs) {
      info.success(msgs);
    }, function(err) {
      info.error(err);
    })
  }

  this.getChatMessagesByConv = function(info) {
    //第一次查询
    if (messageIterator == null) {
      messageItterator = info.conv.createMessagesIterator({
        limit: 10
      });
      messageItterator.next().then(function(result) {
        info.success(result);
      }, function(err) {
        info.error(err);
      });
    } else {
      // if (info.conv.id == currentConv.id) {
      //同一个对话获取信息
      messageItterator.next().then(function(result) {
        info.success(result);
      }, function(err) {
        info.error(err);
      });
      // } else {

      // }
    }
  }

  this.sendChatMsg = function(info) {
    var msgObj = null;
    switch (info.type) {
      case 'text':
        msgObj = new AV.TextMessage(info.content);
        break;
      default:
        break;
    }
    if (msgObj != null) {
      currentConv.send(msgObj).then(function(msg) {
        console.log('msg send success');
        console.log(msg);
        info.success(msg);
      }, function(err) {
        alert(JSON.stringify(err));
        info.error(err);
      })
    }
  }
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});