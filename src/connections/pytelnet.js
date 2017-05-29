'use babel';

import TelnetClient from './telnet/telnetcli.js';
import Logger from '../board/logger.js';

var AYT = '\xff\xf6'

export default class PyTelnet {

  constructor(params){
    this.type = "telnet"
    this.stream = new TelnetClient('pycomboard');
    this.connected = false
    this.logger = new Logger('PyTelnet')
    this.listening = false
    this.username_sent = false
    this.password_sent = false
    this.params = params
    this.pingTimer = null
    this.receive_buffer = ""
    this.ayt_pending = false
  }

  sendPing(){
    if(this.ayt_pending){
      this.ayt_pending = false
      return false
    }
    this.ayt_pending = true
    this.send(AYT)
    return true
  }

  connect(onconnect,onerror,ontimeout){
    this.logger.verbose("Connecting to telnet on "+this.params.host)
    this.onconnect = onconnect
    this.onerror = onerror
    this.ontimeout = ontimeout
    this.username_sent = false
    this.password_sent = false
    var _this = this
    this.stream.connect(this.params,function(err){
      _this.logger.silly("Connected callback ("+err+")")
      onconnect(new Error(err))
    });
    this.stream.setReportErrorHandler(function(telnet,error){
      if(onerror){
        if (!error) {
          error = "Connection lost"
        }
        onerror(new Error(error))
      }
    })

    var timeout_triggered = false
    this.stream.setReportTimeoutHandler(function(telnet,error){
      _this.logger.silly("Telnet timeout")
      if(ontimeout){
        if(!timeout_triggered){
          timeout_triggered = true
          ontimeout(error)
        }

      }
    })

    this.stream.setReportAYTHandler(function(telnetcli,type){
      _this.ayt_pending = false
    })
  }

  disconnect(cb){
    this.stream.close()
    // give the connection time to close.
    // there is no proper callback for this in the telnet lib.
    setTimeout(cb,200)
  }

  registerListener(cb){
    var _this = this
    this.onmessage = cb

    this.stream.read(function(err,recv){
      if(recv){
        recv=recv.join('');
        cb(recv)
      }
    });
  }

  send(mssg,cb){
    var data = new Buffer(mssg,"binary")
    this.send_raw(data,cb)
  }

  send_raw(data,cb){
    this.stream.write(data,function(){
      if(cb) cb()
    })
  }

  send_cmd(cmd,cb){
    var mssg = '\x1b\x1b' + cmd
    data = new Buffer(mssg,"binary")
    this.send_raw(data,cb)
  }

  flush(cb){
    cb()
  }
}
