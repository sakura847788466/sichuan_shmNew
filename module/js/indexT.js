$(function () {
  var feedback = "";
  var DS_1870 = document.getElementById('DS_1870');

  var pageNo = 1;
  var pageSize = 6;
  $('.el-button--small').on('click', function () {
    var ipVal = $('.el-input__inner').val()
    if (ipVal == '') {
      $.messager.alert('提示', '请先设置ip')
    } else {
      $('.el-message-box').css('display', 'none')
      $('.maskT').css('opacity', '0')
      $('.maskT').css('z-index', '-1000')
      $('.con_cc').on('click', function () {
        //点击进入之后直接执行进卡   点击进卡
        $('.maskInfo').show()
        $('.maskInfo').animate({
          height: '700px',
          width: '900px'
        })

        $('.con_tL').css('display', 'none')
        WEB_OcxTest(ipVal, pageNo);

      })
    }

  })



  //退卡
  $('.outCard').on('click', function (res) {
    WEB_MoveCard()
  })

  $('.data').click(function () {
    // $('#cc').css('width','53%')
    $('#cc').show()
  })

  // 日历事件
  $('#cc').calendar({
    current: new Date(),
    months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    weeks: ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  })


  $('#cc').calendar({
    onSelect: function (date) {
      var y = date.getFullYear();
      var m = date.getMonth() + 1;
      var d = date.getDate();
      var dateTime = y + "-" + (m < 10 ? ("0" + m) : m) + "-" + (d < 10 ? ("0" + d) : d);
      $('.data').val(dateTime)
      $('#cc').hide()
    }
  })
})
// load(feedback, ipVal, 1, pageSize, startT, endT)

/*------------------------------------------------------------------------------------------------相关函数------------------------------------------------------------ */
function load (feedback, ipVal, pageNo, startT, endT) {
  var data = JSON.stringify({ //请求参数一
    busBgnDate: startT,
    busEndDate: endT,
    busType: "02",
    cardType: "3101",
    cardNo: feedback, //需要传入ocx扫描返回的参数 feedback  身份证号
    pageNo: pageNo,
    patientId: "",
    pageSize: 9
  })
  var baseData = Base64.encode(data) //data转化base64编码

  //noise获取
  var noise = Math.uuid(15) //15位uuid标识符
  //sign设置
  var sign = "appid=NCSZXYY0635021&data=" + baseData + "&noise=" + noise;
  var stringSign = sign + "&key=9132beb9c3de5d854be3220918&version=1.0";
  var signEnd = hex_md5(stringSign).toUpperCase()
  console.log(signEnd)
  //最终请求参数
  var requestData = {
    "appid": "NCSZXYY0635021",
    "data": baseData, //base64编码
    "noise": noise, //随机数 
    "version": "1.0", //固定版本号
    "sign": signEnd
  }
  // 发起请求
  jQuery.support.cors = true;
  $.ajax({
    url: ipVal + '/medical-web/api/medical/getEBillUnPrintList?random= ' + Date.now(), //http://[ip]:[port]/[service]/api/medical/ [接口服务标识]
    type: 'POST',
    data: requestData,
    headers: { 'Content-Type': 'text/plain;charset=utf8' },
    dataType: 'json',
    async: false,
    crossDomain: true == !(document.all),
    cache: false, //不从浏览器缓存中加载请求信息
    success: (function (res) {
      console.log(res)
      var resData = Base64.decode(res.data)
      var resDataP = JSON.parse(resData)
      if (resDataP.result !== 'S0000') {
        var ticketList = Base64.decode(resDataP.message)
        $.messager.alert('提示', '未找到相关数据')

      } else {
        var ticketList = Base64.decode(resDataP.message)
        var tickList_end = JSON.parse(ticketList)
        var loadList = tickList_end.billList;
        for (var i = 0; i < loadList.length; i++) {
          var str = "<div class='item'>" +
            "<div>" + timeStr((loadList[i].busNo.toString())) + "</div>" +
            "<div>" + (timeStr(loadList[i].ivcDateTime.toString())) + "</div>" +
            "<div>" + loadList[i].billNo + "</div>" +
            "<div>" + loadList[i].totalAmt + "</div>" +
            "<div>" + loadList[i].billName + "</div>" +
            "<div>" +
            "<div class='print' data-index=" + i + "  >打印票据</div>" +
            "</div>" +
            "</div>"

          $('.infoList_c').append(str)
        }
        /*分页 */
        $every_page = 6;

        $items = $(".infoList_c  .item");
        $total_all = $items.length; //总条数
        console.log($total_all)
        $page_num = Math.round($total_all / $every_page) //向上取整（2.5 ==> 3）

        $("#total_page").text($page_num);
        //初始化页面，只显示前5条。
        $(".infoList_c  .item:gt(" + ($every_page - 1) + ")").each(function () {
          $(this).hide();
        })
        //点击下一条按钮函数。
        $("#next_page").click(function () {
          $current_page = ($("#current_page").text()); //获取当前页码
          console.log($current_page)
          if ($current_page < $page_num) {
            $("#current_page").text(++$current_page);
            $.each($(".infoList_c  .item"), function (index, item) {
              //获取下一页显示的开始索引。
              var start = ($("#current_page").text() - 1) * $every_page;
              if (index >= start && index < start + $every_page) {
                $(this).show();
              } else {
                $(this).hide();
              }
            })
          } else {
            return false;
          }
        })
        $("#pre_page").click(function () { //上一页
          $current_page = ($("#current_page").text());
          if ($current_page > 1) {
            $("#current_page").text(--$current_page);
            $.each($(".infoList_c  .item"), function (index, item) {
              var start = ($("#current_page").text() - 1) * $every_page;
              if (index >= start && index < start + $every_page) {
                $(this).show();
              } else {
                $(this).hide();
              }
            })
          } else {
            return false;
          }
        })

        /*分页 */
        $('.print').on('click', function () {
          var index = $(this).attr("data-index")
          //1.获取电子票据明细接口拿到placeCode参数
          //2.获取扫描参数 
          var request_number1 = JSON.stringify({
            billNo: loadList[index].billNo, //电子发票号码
            billBatchCode: loadList[index].billBatchCode, //电子票据编码
            random: loadList[index].random //电子校验码
          })
          var noise = Math.uuid(16)
          var request_codeBase64 = Base64.encode(request_number1)

          var request_numberSign = "appid=NCSZXYY0635021&data=" + request_codeBase64 + "&noise=" + noise + "&key=9132beb9c3de5d854be3220918&version=1.0";
          var signEnd = hex_md5(request_numberSign).toUpperCase()

          var request_end = { // 请求的最终数据
            "appid": "NCSZXYY0635021",
            "data": request_codeBase64,
            "noise": noise,
            "version": "1.0",
            "sign": signEnd
          }

          $.ajax({
            url: ipVal + '/medical-web/api/medical/getBillDetail?random= ' + Date.now(),
            method: 'POST',
            data: request_end,
            headers: { 'Content-Type': 'text/plain;charset=utf8' },
            cache: false,
            success: (function (res) {
              console.log(res)
              var result = Base64.decode(res.data)
              var resultStr = JSON.parse(result)
              var resultT = Base64.decode(resultStr.message)
              var test = JSON.parse(resultT)
              console.log('result=' + resultT)
              /*--------------扫描获取有效纸质票据代码------------------------*/
              var saoM = DS_1870.AutoTurnOnScanner(); //返回纸质票据代码
              // alert(saoM)
              if (saoM == '' || saoM == null) {
                $.messager.alert('提示', '未获得纸质票据代码')
              } else {
                //获取可用票据号

                var request_number2 = JSON.stringify({
                  placeCode: "00000",//开票点信息
                  pBillBatchCode: "151060117"//纸质票据代码

                })
                var request_codeBase64 = Base64.encode(request_number2)
                var noise = Math.uuid(16)
                console.log('......' + noise)
                var request_numberSign = "appid=NCSZXYY0635021&data=" + request_codeBase64 + "&noise=" + noise + "&key=9132beb9c3de5d854be3220918&version=1.0";
                var signEnd = hex_md5(request_numberSign).toUpperCase()

                var request_end = { // 请求的最终数据
                  "appid": "NCSZXYY0635021",
                  "data": request_codeBase64,
                  "noise": noise,
                  "version": "1.0",
                  "sign": signEnd
                }
                console.log("详情" + ipVal)
                $.ajax({
                  url: ipVal + '/medical-web/api/medical/getPaperBillNo?random= ' + Math.random(),
                  method: 'POST',
                  data: request_end,
                  headers: { 'Content-Type': 'text/plain;charset=utf8' },
                  cache: false,
                  success: function (res) {
                    console.log(res)
                    var result = Base64.decode(res.data)
                    var resultStr = JSON.parse(result)
                    var resultT = Base64.decode(resultStr.message)
                    console.log(resultT)
                    var resultTest = JSON.parse(resultT)
                    var numberCode = resultTest.pBillNo
                    var BillBatchCodeCode = resultTest.pBillBatchCode

                    console.log("票据号" + numberCode)
                    //换开
                    var request_number3 = JSON.stringify({
                      billNo: loadList[index].billNo,//电子票据号
                      billBatchCode: loadList[index].billBatchCode,//电子票据代码
                      pBillBatchCode: BillBatchCodeCode,
                      pBillNo: numberCode,
                      busDateTime: getEndTime_t(),
                      placeCode: "00000",//开票点
                      operator: '自助机01'

                    })
                    console.log("电子票据代码" + loadList[index].billBatchCode)
                    console.log(request_number3)
                    var noise = Math.uuid(32)

                    var request_codeBase64 = Base64.encode(request_number3)
                    console.log(request_codeBase64)
                    var request_numberSign = "appid=NCSZXYY0635021&data=" + request_codeBase64 + "&noise=" + noise + "&key=9132beb9c3de5d854be3220918&version=1.0";
                    console.log(request_numberSign)

                    var signEnd = hex_md5(request_numberSign).toUpperCase()
                    console.log(signEnd)
                    var request_turn = { // 请求的最终数据
                      "appid": "NCSZXYY0635021",
                      "data": request_codeBase64,
                      "noise": noise,
                      "version": "1.0",
                      "sign": signEnd
                    }
                    console.log(request_turn)
                    $.ajax({
                      url: ipVal + '/medical-web/api/medical/turnPaper?random= ' + Date.now(),
                      method: 'POST',
                      data: request_turn,
                      headers: { 'Content-Type': 'text/plain;charset=utf8' },
                      cache: false,
                      success: function (res) {
                        console.log(res)
                        var result = Base64.decode(res.data)
                        var resultStr = JSON.parse(result)
                        var resultT = Base64.decode(resultStr.message)
                        console.log(resultT)
                        if (resultT == '操作成功') {
                          $('.infoList_c')[0].removeChildren('.item')[index]

                        } else {
                          $.messager.alert('提示', resultT)
                        }

                        var testData = test //票据详情下的信息
                        var str0 = "";
                        var str1 = saoM;
                        var str2 = numberCode;

                        var str3 = loadList[index].billBatchCode; //电子票据代码
                        var str4 = loadList[index].billNo + "";

                        var str5 = loadList[index].idCardNo;
                        var str6 = loadList[index].random + "";

                        var str7 = loadList[index].payer;
                        var str8 = "" + date(loadList[index].busDate) + "";

                        var str17 = "" + Arabia_to_Chinese(loadList[index].totalAmt) + "";//大写
                        var str18 = "" + testData.totalAmt + "";//小写
                        var str19 = "业务流水号:" + loadList[index].busNo + "";
                        var str20 = "门诊号:挂号 ";
                        var str21 = "就诊日期:" + date(loadList[index].busDate) + "\r\n";
                        var str22 = "医疗机构类型:医疗机构类型";
                        var str23 = "医保类型:医保类型";
                        var str24 = "医保编码:";
                        var str25 = "性别:" + testData.sex + "\r\n";
                        var str26 = "医疗统筹基金支付:0";
                        var str27 = "其他支付:0";
                        var str28 = "个人账户支付:";
                        var str29 = "个人现金支付:\r\n";
                        var str30 = "个人支付:0";
                        var str31 = "个人自费:0";
                        var str32 = "南充市中心医院";
                        var str33 = 'YYL099'
                        var byteArray = new Array();

                        var position = {
                          n1: 80, //x 
                          n2: 120 //y
                        }

                        //打印数据转换
                        // getBinaryArrayData(str0, function (res0) { //先跳行到起始点
                        //   byteArray[0] = 0xD;
                        //   byteArray[1] = 0x1B;
                        //   byteArray[2] = 0x40;

                        //   byteArray[4] = 27;
                        //   byteArray[5] = 74;
                        //   byteArray[6] = position.n2; // 跳行到起始点 115

                        //   byteArray[7] = 27; //绝对定位
                        //   byteArray[8] = 36;
                        //   byteArray[9] = position.n1; //60
                        //   byteArray[10] = 0;

                        //   byteArray[11] = 28; //字号
                        //   byteArray[12] = 101;
                        //   byteArray[13] = 18;
                        //   byteArray[14] = 18;

                        //   var index = 15;



                        //   for (var m = 0; m < res0.length; m++) {
                        //     byteArray[index++] = res0[m];
                        //   }
                        //   getBinaryArrayData(str1, function (res1) { //纸质票据代码

                        //     byteArray[index++] = 27; //绝对定位
                        //     byteArray[index++] = 36;
                        //     byteArray[index++] = position.n1 + 10;
                        //     byteArray[index++] = 0;

                        //     for (var m = 0; m < res1.length; m++) {
                        //       byteArray[index++] = res1[m];
                        //     }
                        //     getBinaryArrayData(str2, function (res2) { //纸质票据号

                        //       byteArray[index++] = 27; //绝对定位
                        //       byteArray[index++] = 36;
                        //       byteArray[index++] = position.n1 + 60;
                        //       byteArray[index++] = 1;




                        //       for (var m = 0; m < res2.length; m++) {
                        //         byteArray[index++] = res2[m];
                        //       }
                        //       getBinaryArrayData(str3, function (res3) { //电子票据代码

                        //         byteArray[index++] = 27;
                        //         byteArray[index++] = 74;
                        //         byteArray[index++] = 27;

                        //         byteArray[index++] = 27; //绝对定位
                        //         byteArray[index++] = 36;
                        //         byteArray[index++] = position.n1 + 30;
                        //         byteArray[index++] = 0;



                        //         for (var m = 0; m < res3.length; m++) {
                        //           byteArray[index++] = res3[m];
                        //         }
                        //         getBinaryArrayData(str4, function (res4) { //电子票据号码


                        //           byteArray[index++] = 27; //绝对定位
                        //           byteArray[index++] = 36;
                        //           byteArray[index++] = position.n1 + 70;
                        //           byteArray[index++] = 1;





                        //           for (var m = 0; m < res4.length; m++) {
                        //             byteArray[index++] = res4[m];
                        //           }
                        //           getBinaryArrayData(str5, function (res5) { //idCard
                        //             byteArray[index++] = 27;
                        //             byteArray[index++] = 74;
                        //             byteArray[index++] = 27;

                        //             byteArray[index++] = 27; //绝对定位
                        //             byteArray[index++] = 36;
                        //             byteArray[index++] = position.n1 + 60;
                        //             byteArray[index++] = 0;



                        //             for (var m = 0; m < res5.length; m++) {
                        //               byteArray[index++] = res5[m];
                        //             }
                        //             getBinaryArrayData(str6, function (res6) { //校验码


                        //               byteArray[index++] = 27; //绝对定位
                        //               byteArray[index++] = 36;
                        //               byteArray[index++] = position.n1 + 50;
                        //               byteArray[index++] = 1;

                        //               for (var m = 0; m < res6.length; m++) {
                        //                 byteArray[index++] = res6[m];
                        //               }
                        //               getBinaryArrayData(str7, function (res7) { //收款人

                        //                 byteArray[index++] = 27; //跳行间距
                        //                 byteArray[index++] = 74;
                        //                 byteArray[index++] = 27;

                        //                 byteArray[index++] = 27; //绝对定位
                        //                 byteArray[index++] = 36;
                        //                 byteArray[index++] = position.n1 + 10;
                        //                 byteArray[index++] = 0;

                        //                 for (var m = 0; m < res7.length; m++) {
                        //                   byteArray[index++] = res7[m];
                        //                 }
                        //                 getBinaryArrayData(str8, function (res8) { //开票日期


                        //                   byteArray[index++] = 27; //绝对定位
                        //                   byteArray[index++] = 36;
                        //                   byteArray[index++] = position.n1 + 60;
                        //                   byteArray[index++] = 1;

                        //                   for (var m = 0; m < res8.length; m++) {
                        //                     byteArray[index++] = res8[m];
                        //                   }
                        //                   /*循环的内容*/

                        //                   for (var i = 0; i < testData.chargeDetail.length; i++) {
                        //                     var str_num = testData.chargeDetail[i].amt.toString();
                        //                     var number = testData.chargeDetail[i].number.toString();

                        //                     getBinaryArrayData(testData.chargeDetail[i].chargeName, function (res24) { //费用类型

                        //                       console.log(res24)
                        //                       byteArray[index++] = 27;
                        //                       byteArray[index++] = 74;
                        //                       byteArray[index++] = 70;

                        //                       byteArray[index++] = 27; //绝对定位
                        //                       byteArray[index++] = 36;
                        //                       byteArray[index++] = position.n1 + 15;
                        //                       byteArray[index++] = 0;



                        //                       for (var m = 0; m < res24.length; m++) {
                        //                         byteArray[index++] = res24[m];
                        //                       }
                        //                       getBinaryArrayData(number, function (res25) {
                        //                         console.log("数量" + res25)
                        //                         byteArray[index++] = 27; //绝对定位
                        //                         byteArray[index++] = 36;
                        //                         byteArray[index++] = position.n1 + 76;
                        //                         byteArray[index++] = 0;


                        //                         for (var m = 0; m < res25.length; m++) {
                        //                           byteArray[index++] = res25[m];
                        //                         }
                        //                         getBinaryArrayData(str_num, function (res26) {
                        //                           console.log("金额" + res26)
                        //                           byteArray[index++] = 27; //绝对定位
                        //                           byteArray[index++] = 36;
                        //                           byteArray[index++] = position.n1 + 114;
                        //                           byteArray[index++] = 0;



                        //                           for (var m = 0; m < res26.length; m++) {
                        //                             byteArray[index++] = res26[m];
                        //                           }
                        //                           getBinaryArrayData(testData.chargeDetail[i].remark, function (res27) {
                        //                             console.log("备注" + res27)
                        //                             byteArray[index++] = 27; //绝对定位
                        //                             byteArray[index++] = 36;
                        //                             byteArray[index++] = position.n1 + 156;
                        //                             byteArray[index++] = 0;


                        //                             for (var m = 0; m < res27.length; m++) {
                        //                               byteArray[index++] = res27[m];
                        //                             }
                        //                           });
                        //                         });
                        //                       });
                        //                     });
                        //                   }
                        //                   /*--------------循环内容----------------------*/

                        //                   getBinaryArrayData(str17, function (res17) { //合计(大写)


                        //                     byteArray[index++] = 27; //绝对定位
                        //                     byteArray[index++] = 36;
                        //                     byteArray[index++] = position.n1 + 35;
                        //                     byteArray[index++] = 0;


                        //                     byteArray[index++] = 27;
                        //                     byteArray[index++] = 74;
                        //                     byteArray[index++] = 180;

                        //                     byteArray[index++] = 27;
                        //                     byteArray[index++] = 74;
                        //                     byteArray[index++] = 115;

                        //                     for (var m = 0; m < res17.length; m++) {
                        //                       byteArray[index++] = res17[m];
                        //                     }

                        //                     getBinaryArrayData(str18, function (res18) { //合计()

                        //                       byteArray[index++] = 27; //绝对定位
                        //                       byteArray[index++] = 36;
                        //                       byteArray[index++] = position.n1 + 10;
                        //                       byteArray[index++] = 1;
                        //                       for (var m = 0; m < res18.length; m++) {
                        //                         byteArray[index++] = res18[m];
                        //                       }
                        //                       getBinaryArrayData(str19, function (res19) { //业务流水
                        //                         byteArray[index++] = 27; //跳行间距
                        //                         byteArray[index++] = 74;
                        //                         byteArray[index++] = 45;


                        //                         byteArray[index++] = 27; //绝对定位
                        //                         byteArray[index++] = 36;
                        //                         byteArray[index++] = position.n1;
                        //                         byteArray[index++] = 0;
                        //                         for (var m = 0; m < res19.length; m++) {
                        //                           byteArray[index++] = res19[m];
                        //                         }
                        //                         getBinaryArrayData(str20, function (res20) { //业务标识
                        //                           byteArray[index++] = 27; //绝对定位
                        //                           byteArray[index++] = 36;
                        //                           byteArray[index++] = position.n1 + 100; //172
                        //                           byteArray[index++] = 0;
                        //                           for (var m = 0; m < res20.length; m++) {
                        //                             byteArray[index++] = res20[m];
                        //                           }
                        //                           getBinaryArrayData(str21, function (res21) { //就诊时间
                        //                             byteArray[index++] = 27; //绝对定位
                        //                             byteArray[index++] = 36;
                        //                             byteArray[index++] = position.n1 + 34;
                        //                             byteArray[index++] = 1;



                        //                             for (var m = 0; m < res21.length; m++) {
                        //                               byteArray[index++] = res21[m];
                        //                             }
                        //                             getBinaryArrayData(str22, function (res22) { //医疗机构类型


                        //                               byteArray[index++] = 27; //绝对定位
                        //                               byteArray[index++] = 36;
                        //                               byteArray[index++] = position.n1;
                        //                               byteArray[index++] = 0;



                        //                               for (var m = 0; m < res22.length; m++) {
                        //                                 byteArray[index++] = res22[m];
                        //                               }
                        //                               getBinaryArrayData(str23, function (res23) { //医保类型
                        //                                 byteArray[index++] = 27; //绝对定位
                        //                                 byteArray[index++] = 36;
                        //                                 byteArray[index++] = position.n1 + 102;
                        //                                 byteArray[index++] = 0;



                        //                                 for (var m = 0; m < res23.length; m++) {
                        //                                   byteArray[index++] = res23[m];
                        //                                 }
                        //                                 getBinaryArrayData(str24, function (res24) { //医保编码
                        //                                   byteArray[index++] = 27; //绝对定位
                        //                                   byteArray[index++] = 36;
                        //                                   byteArray[index++] = position.n1 + 170;
                        //                                   byteArray[index++] = 0;



                        //                                   for (var m = 0; m < res24.length; m++) {
                        //                                     byteArray[index++] = res24[m];
                        //                                   }
                        //                                   getBinaryArrayData(str25, function (res25) { //性别
                        //                                     byteArray[index++] = 27; //绝对定位
                        //                                     byteArray[index++] = 36;
                        //                                     byteArray[index++] = position.n1 + 34;
                        //                                     byteArray[index++] = 1;



                        //                                     for (var m = 0; m < res25.length; m++) {
                        //                                       byteArray[index++] = res25[m];
                        //                                     }
                        //                                     getBinaryArrayData(str26, function (res26) { //医疗统筹基金支付
                        //                                       byteArray[index++] = 27; //绝对定位
                        //                                       byteArray[index++] = 36;
                        //                                       byteArray[index++] = position.n1;
                        //                                       byteArray[index++] = 0;



                        //                                       for (var m = 0; m < res26.length; m++) {
                        //                                         byteArray[index++] = res26[m];
                        //                                       }
                        //                                       getBinaryArrayData(str27, function (res27) { //其他支付
                        //                                         byteArray[index++] = 27; //绝对定位
                        //                                         byteArray[index++] = 36;
                        //                                         byteArray[index++] = position.n1 + 102;
                        //                                         byteArray[index++] = 0;



                        //                                         for (var m = 0; m < res27.length; m++) {
                        //                                           byteArray[index++] = res27[m];
                        //                                         }
                        //                                         getBinaryArrayData(str28, function (res28) { //个人账户支付
                        //                                           byteArray[index++] = 27; //绝对定位
                        //                                           byteArray[index++] = 36;
                        //                                           byteArray[index++] = position.n1 + 170;
                        //                                           byteArray[index++] = 0;

                        //                                           for (var m = 0; m < res28.length; m++) {
                        //                                             byteArray[index++] = res28[m];
                        //                                           }
                        //                                           getBinaryArrayData(str29, function (res29) { //个人现金支付
                        //                                             byteArray[index++] = 27; //绝对定位
                        //                                             byteArray[index++] = 36;
                        //                                             byteArray[index++] = position.n1 + 34;
                        //                                             byteArray[index++] = 1;
                        //                                             for (var m = 0; m < res29.length; m++) {
                        //                                               byteArray[index++] = res29[m];
                        //                                             }
                        //                                             getBinaryArrayData(str30, function (res30) { //个人支付
                        //                                               byteArray[index++] = 27; //绝对定位
                        //                                               byteArray[index++] = 36;
                        //                                               byteArray[index++] = position.n1;
                        //                                               byteArray[index++] = 0;

                        //                                               for (var m = 0; m < res30.length; m++) {
                        //                                                 byteArray[index++] = res30[m];
                        //                                               }
                        //                                               getBinaryArrayData(str31, function (res31) { //个人自费
                        //                                                 byteArray[index++] = 27; //绝对定位
                        //                                                 byteArray[index++] = 36;
                        //                                                 byteArray[index++] = position.n1 + 102;
                        //                                                 byteArray[index++] = 0;
                        //                                                 for (var m = 0; m < res31.length; m++) {
                        //                                                   byteArray[index++] = res31[m];
                        //                                                 }
                        //                                                 getBinaryArrayData(str32, function (res32) {
                        //                                                   byteArray[index++] = 27; //绝对定位
                        //                                                   byteArray[index++] = 36;
                        //                                                   byteArray[index++] = position.n1 + 35;
                        //                                                   byteArray[index++] = 0;

                        //                                                   byteArray[index++] = 27; //跳行间距
                        //                                                   byteArray[index++] = 74;
                        //                                                   byteArray[index++] = 70;




                        //                                                   for (var m = 0; m < res32.length; m++) {
                        //                                                     byteArray[index++] = res32[m];
                        //                                                   }
                        //                                                   getBinaryArrayData(str33, function (res33) {
                        //                                                     byteArray[index++] = 27; //绝对定位
                        //                                                     byteArray[index++] = 36;
                        //                                                     byteArray[index++] = position.n1 + 52;
                        //                                                     byteArray[index++] = 1;

                        //                                                     for (var m = 0; m < res33.length; m++) {
                        //                                                       byteArray[index++] = res33[m];
                        //                                                     }
                        //                                                     byteArray[index++] = 0x0C;

                        //                                                     var arrayBuffer = new Uint8Array(byteArray)
                        //                                                     console.log(arrayBuffer)

                        //                                                     Bytes2HexString(arrayBuffer);
                        //                                                     //ocx打印
                        //                                                   });
                        //                                                 });
                        //                                               });
                        //                                             });
                        //                                           });
                        //                                         });
                        //                                       });
                        //                                     });
                        //                                   });
                        //                                 });
                        //                               });
                        //                             });
                        //                           });
                        //                         });
                        //                       });
                        //                     });
                        //                   });
                        //                 });
                        //               });
                        //             });
                        //           });
                        //         });
                        //       });
                        //     });
                        //   });
                        // });
                      },
                      fail: function (err) {
                        console.log(err)
                      }
                    })
                  },
                  fail: function (res) {
                    console.log(res)
                  }
                })


              }
            }),
            fail: (function (err) {
              alert("请求出错" + err)
            })
          })
        })
      }
    }),
    fail: (function (err) {
      alert("无效的ip" + err)
    })
  })
}
//先获取本地时间 模拟时间数据
function Appendzero (obj) {
  if (obj < 10) return "0" + "" + obj;
  else return obj;
}
//时间格式2019-20-23
function date (time) {
  var timeStr = time.toString()
  var timer = timeStr.slice(0, 4)
  var mouth = timeStr.slice(4, 6)
  var data = timeStr.slice(6, 8)

  var newTime = timer + '-' + mouth + '-' + data
  return newTime;
}
//xml
function stringToXML (xmlData) {
  if (window.ActiveXObject) {
    //for IE
    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = "false";
    xmlDoc.loadXML(xmlData);
    // return xmlDoc;
    $.ajax({
      url: 'http://10.0.0.168:8089/iih.ei.std.i.IIHService?wsdl&access_token=86f8406a-2244-4ae8-b61d-94874ebdb883 ' + Date.now(),
      method: 'POST',
      data: {
        code: 'A0034 ',
        xml: encodeURIComponent(xmlData)
      },
      contentType: 'application/json',
      cache: false,
      success: function (res) {
        console.log("xml" + res)
        console.log('his', res)
      },
      fail: function (err) {
        console.log(err)
      }
    })
  }
  else if (document.implementation && document.implementation.createDocument) {
    //for Mozila
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(xmlData, "text/xml");
    return xmlDoc;
  }
}
function getBinaryArrayData (text, resultCallBack) {

  var buffer = new Array(sizeOfGbk(text));
  var indexDV = 0;
  for (var i = 0; i < text.length; ++i) {
    if (text.charCodeAt(i) > 0xff) {
      var utfStr = text.charCodeAt(i).toString(16);
      var gbkStr = utf2gbOne(utfStr);

      var highByte = parseInt(gbkStr.substring(0, 2), 16);
      var lowByte = parseInt(gbkStr.substring(2, 4), 16);
      buffer[indexDV++] = highByte;
      buffer[indexDV++] = lowByte;

    } else {
      buffer[indexDV++] = text.charCodeAt(i);
    }
  }
  resultCallBack(buffer);
}
/* */
function sizeOfGbk (str) {
  var total = 0,
    charCode,
    i,
    len;
  for (i = 0, len = str.length; i < len; i++) {
    charCode = str.charCodeAt(i);
    if (charCode <= 0xff) {
      total += 1;
    } else {
      total += 2;
    }
  }
  return total;
}
/* */
function getCodeStr () {
  return codeStr
}
/*   */
function utf2gbOne (utfCode) {
  var codeStr = getCodeStr();
  var gbkCode;
  var utfStart;
  var gbkStart = 0;

  utfStart = new Number(codeStr.indexOf(utfCode.toLowerCase()));
  if (utfStart != -1) {
    gbkStart = utfStart - 5;
    gbkCode = codeStr.substring(gbkStart, gbkStart + 4);
  } else {
    gbkCode = "a1a1";
  }

  return gbkCode;
}

/* ------------------------打印相关------------------------------------*/
function Bytes2HexString (arrBytes) {
  var str = "";
  for (var i = 0; i < arrBytes.length; i++) {
    var tmp;
    var num = arrBytes[i];
    if (num < 0) {
      //此处填坑，当byte因为符合位导致数值为负时候，需要对数据进行处理
      tmp = (255 + num + 1).toString(16);
    } else {
      tmp = num.toString(16);
    }
    if (tmp.length == 1) {
      tmp = "0" + tmp;
    }
    str += tmp;
  }
  console.log("转换的" + str)
  WEB_print(str) //打印

}

function WEB_print (data) {
  feedback = DS_1870.PrintData(data);
  console.log(feedback) //打印状态
}
//ocx测试控件连接
function WEB_OcxTest (ipVal, pageNo) {
  feedback = DS_1870.OcxTest();
  console.log(feedback) //判断ocx的链接状态
  if (feedback) {
    yh(ipVal, pageNo)

  } else {
    $.messager.alert('提示', 'ocx版本不匹配,请安装最新的版本')
  }
}


//倒计时
function yh (ipVal, pageNo) {
  t = setTimeout(yh, 1000); //全局的定时器
  ReadIdcard(ipVal, pageNo); //获取磁卡信息
  var i = $('.a').html();
  i -= 1; //i每次减一
  $('.a').html(i)
  if (i <= 0) {
    clearTimeout(t);
    $('.a').css('display', 'none')
    location.reload()
  }; //i=0时结束

};

//签名算法
function setSign (data) {
  var appid = 'NCSZXYY0635021'
  var key = '9132beb9c3de5d854be3220918'
  var version = '1.0'
  var noise = Math.uuid(32)
  var request_codeBase64 = Base64.encode(data)
  var request_numberSign = "appid=" + appid + "&data=" + request_codeBase64 + "&noise= " + noise + "&key=" + key + "&version=" + version + "";

};

//读卡
function ReadIdcard (ipVal, pageNo) {
  feedback = DS_1870.ReadIdcard();
  if (feedback == '0') {
    clearInterval(t)
    setTimeout(function () {
      $('.loadEffect').hide()
      $('.maskInfo').hide()
      $('.user').show()
    }, 1000)
    ReadIdcardNum(ipVal, pageNo);
  } else if (feedback == '1') {


  } else if (feedback == '2') {

  } else {
    return false;
  }

}
//获取身份证
function ReadIdcardNum (ipVal, pageNo) {
  feedback = DS_1870.ReadIdcardMessage(1);
  feedback2 = DS_1870.ReadIdcardMessage(2);
  feedback3 = DS_1870.ReadIdcardMessage(3);
  feedback4 = DS_1870.ReadIdcardMessage(4);



  $('.kaHao').val(feedback)
  $('.name').val(feedback2)
  $('.sex').val(feedback3)
  $('.age').val(feedback4)
  $('.idCard').val(feedback)

  $('.userIstrue').click(ipVal, function () {
    $('.loadEffect').css('z-index', '2000')
    $('.loadEffect').show()

    setTimeout(function () {
      $('.loadEffect').hide()
      $('.user').hide()
      $('.infoListW').show()
    }, 1000)
    var start = getTime();
    console.log(start)
    var end = getEndTime();
    console.log(end)
    load(feedback, ipVal, pageNo, start, end) //执行load()渲染

  })

}
function WEB_TurnOnScanner () // 打开扫描头 扫描
{
  feedback = DS_1870.TurnOnScanner();
  if ("" == feedback) { //返回纸质票据编码和票据号
    alert("无条码信息");
    return feedback
  } else {
    //执行
  }

}

/*-------------------------------- */
//10进制转换16进制

function Sixteen_ten (str, status) { //print true 10->16    false 16->10
  str = Number(str);

  if (status) {
    return '0x' + str.toString(16)
  } else {
    return parseInt(str, 16)
  }
}
//数字转换大写金额
function Arabia_to_Chinese (Num) {
  // debugger;
  for (i = Num.length - 1; i >= 0; i--) {
    Num = Num.replace(",", "")
    Num = Num.replace(" ", "")
    Num = Num.replace("￥", "")
  }
  if (isNaN(Num)) { //验证输入的字符是否为数字
    alert("请检查小写金额是否正确");
    return;
  }
  //---字符处理完毕，开始转换，转换采用前后两部分分别转换---//
  part = String(Num).split(".");
  newchar = "";
  //小数点前进行转化
  for (i = part[0].length - 1; i >= 0; i--) {
    if (part[0].length > 10) { alert("位数过大，无法计算"); return ""; } //若数量超过拾亿单位，提示
    tmpnewchar = ""
    perchar = part[0].charAt(i);
    switch (perchar) {
      case "0":
        tmpnewchar = "零" + tmpnewchar;
        break;
      case "1":
        tmpnewchar = "壹" + tmpnewchar;
        break;
      case "2":
        tmpnewchar = "贰" + tmpnewchar;
        break;
      case "3":
        tmpnewchar = "叁" + tmpnewchar;
        break;
      case "4":
        tmpnewchar = "肆" + tmpnewchar;
        break;
      case "5":
        tmpnewchar = "伍" + tmpnewchar;
        break;
      case "6":
        tmpnewchar = "陆" + tmpnewchar;
        break;
      case "7":
        tmpnewchar = "柒" + tmpnewchar;
        break;
      case "8":
        tmpnewchar = "捌" + tmpnewchar;
        break;
      case "9":
        tmpnewchar = "玖" + tmpnewchar;
        break;
    }
    switch (part[0].length - i - 1) {
      case 0:
        tmpnewchar = tmpnewchar + "元";
        break;
      case 1:
        if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
        break;
      case 2:
        if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
        break;
      case 3:
        if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
        break;
      case 4:
        tmpnewchar = tmpnewchar + "万";
        break;
      case 5:
        if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
        break;
      case 6:
        if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
        break;
      case 7:
        if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
        break;
      case 8:
        tmpnewchar = tmpnewchar + "亿";
        break;
      case 9:
        tmpnewchar = tmpnewchar + "拾";
        break;
    }
    newchar = tmpnewchar + newchar;
  }
  //小数点之后进行转化
  if (String(Num).indexOf(".") != -1) {
    if (part[1].length > 2) {
      alert("小数点之后只能保留两位,系统将自动截段");
      part[1] = part[1].substr(0, 2)
    }
    for (i = 0; i < part[1].length; i++) {
      tmpnewchar = ""
      perchar = part[1].charAt(i)
      switch (perchar) {
        case "0":
          tmpnewchar = "零" + tmpnewchar;
          break;
        case "1":
          tmpnewchar = "壹" + tmpnewchar;
          break;
        case "2":
          tmpnewchar = "贰" + tmpnewchar;
          break;
        case "3":
          tmpnewchar = "叁" + tmpnewchar;
          break;
        case "4":
          tmpnewchar = "肆" + tmpnewchar;
          break;
        case "5":
          tmpnewchar = "伍" + tmpnewchar;
          break;
        case "6":
          tmpnewchar = "陆" + tmpnewchar;
          break;
        case "7":
          tmpnewchar = "柒" + tmpnewchar;
          break;
        case "8":
          tmpnewchar = "捌" + tmpnewchar;
          break;
        case "9":
          tmpnewchar = "玖" + tmpnewchar;
          break;
      }
      if (i == 0) tmpnewchar = tmpnewchar + "角";
      if (i == 1) tmpnewchar = tmpnewchar + "分";
      newchar = newchar + tmpnewchar;
    }
  }
  //替换所有无用汉字
  while (newchar.search("零零") != -1)
    newchar = newchar.replace("零零", "零");
  newchar = newchar.replace("零亿", "亿");
  newchar = newchar.replace("亿万", "亿");
  newchar = newchar.replace("零万", "万");
  newchar = newchar.replace("零元", "元");
  newchar = newchar.replace("零角", "");
  newchar = newchar.replace("零分", "");


  if (newchar.charAt(newchar.length - 1) == "元" || newchar.charAt(newchar.length - 1) == "角")
    newchar = newchar + "整"
  //  document.write(newchar);
  return newchar;

}

//his回传

//时间搓截取
function timeStr (timeStr) {
  var times = timeStr.toString()
  var time = times.slice(0, 8);
  return time;
}
//获取起始时间时间搓
function getTime () {
  var bgnDate = new Date()
  var startTime = bgnDate.getFullYear() + "" + Appendzero(bgnDate.getMonth() + 1) + "" + Appendzero(bgnDate.getDate() - 7) + "000000500"


  return startTime;
}
//结束时间
function getEndTime () {
  var bgnDate = new Date();
  var endTime = bgnDate.getFullYear() + "" + Appendzero(bgnDate.getMonth() + 1) + "" + Appendzero(bgnDate.getDate()) + "000000500"
  return endTime;
}
function getEndTime_t () {
  var bgnDate = new Date();
  var endTime = bgnDate.getFullYear() + "" + Appendzero(bgnDate.getMonth() + 1) + "" + Appendzero(bgnDate.getDate()) + "" + Appendzero(bgnDate.getHours()) + "" + Appendzero(bgnDate.getMinutes()) + "" + Appendzero(bgnDate.getSeconds()) + "" + bgnDate.getMilliseconds()
  return endTime;
}
//查询
function find () {
  var date = ($('.data').val()).toString()
  var ipVal = 'http://10.0.42.226:7001'
  var years = date.split('-')[0]
  var months = date.split('-')[1]
  var sData = ((date.split('-')[2] - 7) < 10 ? ("0" + (date.split('-')[2] - 3)) : (date.split('-')[2] - 3))
  var eData = date.split('-')[2]

  var startT = years + months + sData + '235900000';
  var endT = years + months + eData + '235900000';

  console.log('find')
  $('.infoList_c .item').remove()
  load(feedback, ipVal, 1, startT, endT)
}

// 条码弹出层
function qrCode () {
  console.log()
  $('.qrCode').show()
  $('.qrCode').animate({
    height: '700px',
    width: '900px'
  })
}