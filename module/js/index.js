

$('.el-button--small').click(function () {


  console.log(date(20200112121200000))

  // $.ajax({
  //   url: 'http://58.22.61.222:36771/medical-web/api/medical/turnPaper ',
  //   method: 'POST',
  //   data: {

  //   },
  //   contentType: 'text/plain',
  //   cache: false,
  //   success: function (res) {
  //     console.log(res)
  //   }, fail: function (err) {

  //   }
  // })
})

function date (time) {
  var timeStr = time.toString()
  var timer = timeStr.slice(0, 4)
  var mouth = timeStr.slice(4, 6)
  var data = timeStr.slice(6, 8)

  var newTime = timer + '-' + mouth + '-' + data
  return newTime;
}