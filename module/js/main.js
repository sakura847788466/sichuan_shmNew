//require.js的全局配置
/*
  @Authors  by Ada
  @data 2019-10-28
  @v  19102801

*/
'use strict';
(function () {
  require.config({
    baseUrl: 'js/', //基本路径 出发点在根目录下
    paths: {
      //映射: 模块标识名: 路径
      alerter: './modules/alerter', //此处不能写成alerter.js,会报错
      dataService: './modules/dataService',
      ApiConfig: './ApiConfig/ApiConfig'
    }
  })
  require(['alerter', 'ApiConfig'], function (alerter, ApiConfig) {
    //模块引入
    alerter.showMsg()
  })
})()