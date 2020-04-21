const innerAudioContext = wx.createInnerAudioContext()
Page({

  data: {
    startTime:0,
    x:0,
    y:0,
    isFirstCallBack:true,
    isExecute:false,
    isShow: false,
    list: [],
    shakeTip:'',
    resp: {},
    audioCtx:null,
    isBg: false,
    ifSpread: false,
    currentTime: 0 //当前播放进度
  }, 
  onReady: function(){
    
  },
  onShow: function(){
    innerAudioContext.src = 'https://static.leizhenxd.com/shake.mp3'
    innerAudioContext.volume = 0
    innerAudioContext.play();
    this.fetch()
  },
  addTimeUpdateListener: function(){
    let that = this;
    innerAudioContext.onTimeUpdate(function(){
      if(that.data.isBg && ((new Date().getTime()-that.data.currentTime)/1000) >=2) {
        console.log(((new Date().getTime()-that.data.currentTime)/1000))
        innerAudioContext.stop();
      }
    })
    innerAudioContext.onEnded(function(){
      
    })
  },
  addListener: function () {
    
    var that = this;
    that.isShow = true;
    wx.onAccelerometerChange(function (e) {
      if (!that.isShow) {
        return
      }
      if (that.data.isFirstCallBack) {
        that.setData({
          startTime: (new Date()).getTime(),
          x : e.x,
          y : e.y,
          isFirstCallBack:false
        })
      } else {
        var endTime = (new Date()).getTime()
        var speedX = (e.x - that.data.x) / (endTime - that.data.startTime) * 100000
        var speedY = (e.y - that.data.y) / (endTime - that.data.startTime) * 100000
        that.setData({
          startTime:endTime,
          x:e.x,
          y:e.y
        })
        if ((Math.abs(speedX) > 1000) || (Math.abs(speedY) > 1000)) {
          if (that.data.isExecute) {
            console.log("正在执行")
          } else {
            //that.data.audioCtx.play()
            
            that.audioPlay();
            wx.vibrateShort({})
           
            that.setData({
              isExecute:true,
              shakeTip:"摇成功"
            })
            //that.data.audioCtx.play()
            setTimeout(function () {
              that.setData({
                isExecute: false,
                shakeTip: ""
              })
            }, 500)
          }
        }
      }
    })
  },
  audioPlay: function () {
    console.log(innerAudioContext)
    if(innerAudioContext.paused){
      innerAudioContext.play()
    }
    this.setData({
      currentTime: new Date().getTime()
    })
    
    setTimeout(() => {
      console.log(innerAudioContext.paused)
    }, 100)
  },
  fetch: function(){
    let that = this;
    // wx.showLoading({
    //   title: '加载中',
    // })
    wx.request({
      url: 'https://wx.leizhenxd.com/test/fetch', //仅为示例，并非真实的接口地址
      data: {},
      dataType: 'json',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        that.setData({ resp: res.data});
        if(res.data.src.indexOf('Funk_Bass') != -1 || res.data.src.indexOf('Beatlt_Drums') != -1 || res.data.src.indexOf('Lover_Drums') != -1){
          that.setData({
            isBg: true
          })
        }
        that.download(res.data.src)
      },
      complete:function(){
      //  wx.hideLoading()
      }
    })
  },
  download: function(url){
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.downloadFile({
      url: url, //仅为示例，并非真实的资源
      header: {
        'content-type': 'application/octet-stream',
      },
      // filePath: wx.env.USER_DATA_PATH + '/temp/',
      success (res) {
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        console.log(res)
        if (res.statusCode === 200) {
          innerAudioContext.volume = 1
          innerAudioContext.src = res.tempFilePath
          that.addListener()
          that.addTimeUpdateListener()
        }
      },
      fail(e) {
        console.log(e)
      },
      complete:function(){
        wx.hideLoading()
      }
    })
  },
  change: function(){
    this.fetch();
  },
  onUnload: function () {
    this.isShow = false;
    wx.stopAccelerometer({})
    innerAudioContext.destroy()
  }
})