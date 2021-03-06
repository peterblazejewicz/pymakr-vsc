'use babel';

var vscode = require('vscode');
import {StatusBarAlignment, window} from "vscode";

import Term from './terminal';
import ApiWrapper from '../main/api-wrapper.js';
import Logger from '../helpers/logger.js'


var EventEmitter = require('events');

export default class PanelView extends EventEmitter {

  constructor(pyboard,settings) {
    super()
    var _this = this
    this.settings = settings
    this.pyboard = pyboard
    this.visible = true
    this.api = new ApiWrapper()
    this.logger = new Logger('PanelView')

    this.statusItems = {}
    this.statusItems['status'] = this.createStatusItem("","pymakr.toggleConnect","Toggle terminal") // name is set using setTitle function
    this.statusItems['run'] = this.createStatusItem("$(triangle-right) Run","pymakr.run","Run current file")
    this.statusItems['sync'] = this.createStatusItem("$(triangle-down) Sync","pymakr.sync","Synchronize project")
    this.statusItems['other'] = this.createStatusItem("$(list-unordered) All commands","pymakr.listCommands","List all available pymakr commands")
    this.setTitle("not connected")

    // terminal logic
    var onTermConnect = function(){
      _this.emit('term-connected')
    }

    // create terminal
    this.terminal = new Term(onTermConnect,this.pyboard,_this.settings)
    this.terminal.setOnMessageListener(function(input){
      _this.emit('user_input',input)
    })
  }

  showQuickPick(){
    var _this = this
    var items = [];
    items.push({ label: "Pymakr > Connect", description: "", cmd: "connect" });
    items.push({ label: "Pymakr > Disconnect", description: "", cmd: "disconnect" });
    items.push({ label: "Pymakr > Run current file", description: "", cmd: "run" });
    items.push({ label: "Pymakr > Synchronize Project", description: "", cmd: "sync" });
    items.push({ label: "Pymakr > Project Settings", description: "", cmd: "project_settings" });
    items.push({ label: "Pymakr > Global Setting", description: "", cmd: "global_settings" });
    items.push({ label: "Pymakr > Extra > Get board version", description: "", cmd: "get_version" });
    items.push({ label: "Pymakr > Extra > Get WiFi AP SSID", description: "", cmd: "get_wifi" });
    items.push({ label: "Pymakr > Extra > List Serial Ports", description: "", cmd: "get_serial" });
    items.push({ label: "Pymakr > Help", description: "", cmd: "help" });

    var options = {
        placeHolder: "Select Action"
    };

    window.showQuickPick(items, options).then(function(selection){
        if (typeof selection === "undefined") {
            return;
        }
        _this.emit(selection.cmd)
        
    });
  }


  createStatusItem(name,command,tooltip){
    if(!this.statusItemPrio){
      this.statusItemPrio = 10
    }
    var statusBarItem = vscode.window.createStatusBarItem(StatusBarAlignment.Left,this.statusItemPrio)
    statusBarItem.command = command
    statusBarItem.text = name
    statusBarItem.tooltip = tooltip
    statusBarItem.show()
    this.statusItemPrio-=1
    return statusBarItem
  }

  // refresh button display based on current status
  setButtonState(runner_busy){
    if (!this.visible) {
      this.setTitle('not connected')
    }else if(this.pyboard.connected) {
      if(runner_busy == undefined){
        // do nothing
      }else if(runner_busy){
        this.setButton('run','primitive-square','Stop')
      }else{
        this.setButton('run','triangle-right','Run')
      }

      this.setTitle('connected')

    }else{
      this.setTitle('not connected')
    }
  }

  setButton(name,icon,text){
      this.statusItems[name].text = "$("+icon+") "+text
  }

  setTitle(status){
    var icon = "x"
    if(status == "connected"){
      icon = "check"
    }
    this.setButton('status',icon,'Pycom Console')
  }


  // UI Stuff
  addPanel(){
    // not implemented
  }

  setPanelHeight(height){
    // not implemented
  }

  hidePanel(){
    this.terminal.hide()
    this.visible = false
  }

  showPanel(){
    this.terminal.clear()
    this.terminal.show()
    this.visible = true
    this.setButtonState()
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    // not implemented
  }

  // Tear down any state and detach
  destroy() {
    this.disconnect()
  }

  getElement() {
    return {};
  }

}
