//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    isShaking: false,
    lastShakeTime: 0,
    accelerometerChangeDelayTime: 0,
    resp: {},
    audioCtx:null,
    backgroundAudioManager:null
  },
  
  onLoad: function () {
    
  },
  onShow: function(){
    
  },
  onReady: function(){
    // let backgroundAudioManager = wx.getBackgroundAudioManager()
    // this.setData({backgroundAudioManager: backgroundAudioManager });
    // // this.audioCtx.play()
    // backgroundAudioManager.title = 'BG Music'
    // backgroundAudioManager.epname = ''
    // backgroundAudioManager.singer = ''
    // backgroundAudioManager.coverImgUrl = ''
    // backgroundAudioManager.src = 'https://static.leizhenxd.com/audio2.mp3'
    
    // console.log(backgroundAudioManager)
    
    this.fetch()
    this.listenAccelerometerChange()
    // this.data.backgroundAudioManager.pause();
  },
  fetch: function(){
    let that = this;
    wx.request({
      url: 'https://wx.leizhenxd.com/test/fetch', //仅为示例，并非真实的接口地址
      data: {},
      dataType: 'json',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res)
        let audioCtx = wx.createAudioContext("myAudio", that)
        that.setData({ resp: res.data, audioCtx: audioCtx});
      }
    })
  },
  listenAccelerometerChange: function(){
    let _this = this;
    const maxSpeed = 1;
    wx.startAccelerometer({
      interval: 'game',
      success: function () {
        console.log("startAccelerometer")
        wx.onAccelerometerChange(function (acceleration) {
          let currMils = new Date().getTime()
          if ((currMils-_this.data.accelerometerChangeDelayTime)<300) return;
          let speed = acceleration.x
         // console.log(speed)
          if (speed > maxSpeed||acceleration.y>maxSpeed||acceleration.z>maxSpeed) {
            console.log("send msg", _this.data.audioCtx)
            _this.data.lastShakeTime = currMils
            _this.setData({ isShaking: true })
            
          }
          if(_this.data.isShaking && speed <=maxSpeed) {
            wx.vibrateShort()
            _this.audioPlay();
          }
          if (speed <= maxSpeed) {
            // _this.bgaudioPause()
            _this.setData({ isShaking: false })
          }
          _this.setData({ accelerometerChangeDelayTime: currMils})
        })
      }
    })
  },
  audioPlay: function () {
      this.data.audioCtx.play()
  },
  audioPause: function () {
    this.data.audioCtx.pause()
  },
  audio14: function () {
    this.data.audioCtx.seek(14)
  },
  audioStart: function () {
    this.data.audioCtx.seek(0)
  },
  bgaudioPlay: function () {
    if (this.data.backgroundAudioManager.paused)
      this.data.backgroundAudioManager.play()
  },
  bgaudioPause: function () {
    if(!this.data.backgroundAudioManager.paused)
      this.data.backgroundAudioManager.pause()
  },
  onShareAppMessage: function(){

  }
})
