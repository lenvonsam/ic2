angular.module('starter.directives',[])
  /**
  attributes:
  restrict: E(HTML Element),A(Dom Attribute),C(class),M(mark)
  template:HTML CODE
  replace: rep

  */
  .directive('loginTest',function(){
    return {
      restrict:'E',
      template:'<div>test<span ng-transclude></span></div>',
      transclude:true,
      replace:true
    }
  });