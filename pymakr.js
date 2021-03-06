var vscode = require('vscode');
var PanelView = require('./lib/main/panel-view').default;
var Pymakr = require('./lib/pymakr').default;
var Pyboard = require('./lib/board/pyboard').default;
var SettingsWrapper = require('./lib/main/settings-wrapper').default;

var pb,v,sw,pymakr

function activate(context) {
    
    sw = new SettingsWrapper()
    pb = new Pyboard(sw)
    v = new PanelView(pb,sw)
    pymakr = new Pymakr({},pb,v,sw)

    var terminal = v.terminal

    var disposable = vscode.commands.registerCommand('pymakr.help', function () {
        terminal.show()
        pymakr.writeHelpText()
    })
    context.subscriptions.push(disposable);

    var disposable = vscode.commands.registerCommand('pymakr.listCommands', function () {
        v.showQuickPick()
    })
    context.subscriptions.push(disposable);

    var disposable = vscode.commands.registerCommand('pymakr.connect', function () {
        terminal.show()
        pymakr.connect()
    })
    context.subscriptions.push(disposable);

    var disposable = vscode.commands.registerCommand('pymakr.run', function () {
        terminal.show()
        pymakr.run()
    })
    context.subscriptions.push(disposable);

    var disposable = vscode.commands.registerCommand('pymakr.sync', function () {
        terminal.show()
        pymakr.sync()
    })
    context.subscriptions.push(disposable);

    var disposable = vscode.commands.registerCommand('pymakr.globalSettings', function () {
        pymakr.openGlobalSettings()
    })
    context.subscriptions.push(disposable);

    var disposable = vscode.commands.registerCommand('pymakr.projectSettings', function () {
        pymakr.openProjectSettings()
    })
    context.subscriptions.push(disposable);

    var disposable = vscode.commands.registerCommand('pymakr.disconnect', function () {
        pymakr.disconnect()
    });
    context.subscriptions.push(disposable);

    // not used. open/close terminal command is already available. 
    // Terminal opens automatically when doing a connect, run or sync action.
    var disposable = vscode.commands.registerCommand('pymakr.toggleREPL', function () {
        pymakr.toggleVisibility()
    });
    context.subscriptions.push(disposable);

    var disposable = vscode.commands.registerCommand('pymakr.toggleConnect', function () {
        if(!pymakr.pyboard.connected){
            terminal.show()
        }
        pymakr.toggleConnect()
    });
    context.subscriptions.push(disposable);


    var disposable = vscode.commands.registerCommand('pymakr.extra.getVersion', function () {
        terminal.show()
        pymakr.getVersion()
    });
    context.subscriptions.push(disposable);

    var disposable = vscode.commands.registerCommand('pymakr.extra.getWifiMac', function () {
        terminal.show()
        pymakr.getWifiMac()
    });
    context.subscriptions.push(disposable);

    var disposable = vscode.commands.registerCommand('pymakr.extra.getSerial', function () {
        terminal.show()
        pymakr.getSerial()
    });
    context.subscriptions.push(disposable);
}


exports.activate = activate;

function deactivate() {
    v.destroy()
}
exports.deactivate = deactivate