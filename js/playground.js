/*
 * Flocking Interactive Demo Playground
 *   Copyright 2012, Vitus Lorenz-Meyer (https://github.com/derDoc)
 *   Copyright 2013-2014, Colin Clark
 *
 * Dual licensed under the MIT and GPL Version 2 licenses.
 */

/*global require, CodeMirror, window*/

var fluid = fluid || require("infusion"),
    flock = fluid.registerNamespace("flock");

(function () {
    "use strict";

    var $ = fluid.registerNamespace("jQuery"),
        demo = fluid.registerNamespace("demo");

    flock.init();

    // TODO: Infuse.

    var setupEditor = function (that, container, theme) {
        theme = theme || "flockingcm";
        container = typeof (container) === "string" ? document.querySelector(container) : container;
        that.firePadInitialized = false;

        var firepadRef = getFirepadRef();


        var codeMirror = CodeMirror(container, { // jshint ignore:line
            mode: {
                name: "javascript",
                json: true
            },
            autoCloseBrackets: true,
            matchBrackets: true,
            smartIndent: true,
            theme: theme,
            indentUnit: 4,
            tabSize: 4,
            lineNumbers: true
        });

        var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror);
        firepad.on('ready', function() {that.firePadInitialized = true;})
        that.editor = firepad;

    };

    var setupPlayButton = function (that) {
        // TODO: might be able to avoid eval()'ing if we load each demo's JavaScript source via Ajax and inject it as a script block.
        that.eventsRef = getEventsRef();        
        that.playButton.click( function () { 
            if (!flock.enviro.shared.model.isPlaying)
            {
                playBack(that);
                if (flock.enviro.shared.model.isPlaying)
                {
                  that.eventsRef.update({playing:true});  
                }                
            }
            else
            {
                pauseBack(that);
            }
        });
    };

    var setupReloadButton = function (that) {
        that.reloadButton.click( function () {
            console.log("test button clicked")
        })
    };

            
            

    function getPlaying(that) {
        that.eventsRef.once('value', function(snapshot) {
            that.playing = snapshot.child('playing').val();
        });
        console.log('got playing');
        console.log(that.playing);
    }

    function getFirepadRef() {
      var ref = new Firebase('https://flickering-heat-7384.firebaseio.com');
      var hash = window.location.hash.replace(/#/g, '');
      if (hash) {
        ref = ref.child(hash).child('firepad');
      } else {
        ref = ref.push(); // generate unique location.
        window.location = window.location + '#' + ref.name(); // add it as a hash to the URL.e
        ref = ref.child('firepad')
      }
      if (typeof console !== 'undefined')
        console.log('Firebase firepad data: ', ref.toString());
      return ref;
    }

    function getEventsRef() {
      var ref = new Firebase('https://flickering-heat-7384.firebaseio.com');
      var hash = window.location.hash.replace(/#/g, '');
      if (hash) {
        ref = ref.child(hash).child('events');
      } else {
        ref = ref.push(); // generate unique location.
        window.location = window.location + '#' + ref.name(); // add it as a hash to the URL.
        ref = ref.child('events')
      }
      if (typeof console !== 'undefined')
        console.log('Firebase events data: ', ref.toString());
      return ref;
    }

    function playBack(that){
        eval(that.editor.getText()); // jshint ignore:line
        that.playButton.html("Pause");
        that.playButton.removeClass("paused");
        that.playButton.addClass("playing");                
        flock.enviro.shared.play();
    }

    function pauseBack(that){
        that.eventsRef.update({playing:false});
        that.playButton.html("Play");
        that.playButton.removeClass("playing");
        that.playButton.addClass("paused");
        flock.enviro.shared.reset();
    }

    function initializePlay(that){
        console.log('blah');
        getPlaying(that);
        if (that.playing == undefined)
        {
            return false;
        }
        else
        {
            return true;
        }
    }

    demo.liveEditorView = function (editorId, selectors) {
        selectors = selectors || {
            playButton: ".playButton",
            reloadButton: ".reloadButton"
        };

        var that = {
            editor: null,
            isPlaying: false,
            playButton: $(selectors.playButton),
            reloadButton: $(selectors.reloadButton),
            selectors: selectors
        };

        setupEditor(that, editorId);
        setupPlayButton(that);
        setupReloadButton(that);

        that.eventsRef.on('child_changed',function(snapshot){
            getPlaying(that);          
            if (that.playing) { // && !flock.enviro.shared.model.isPlaying
                playBack(that);
            } else {
                pauseBack(that);
            }
        });

        var fireBaseInitialized;
        var waitForInitialized = setInterval(function(){
            fireBaseInitialized = initializePlay(that);
            if (fireBaseInitialized && that.firePadInitialized) 
                {                    
                    if (that.playing)
                    {            
                        console.log('on');
                        playBack(that);
                    }
                    else
                    {
                        console.log('halb');
                    }
                    clearInterval(waitForInitialized);
                }
            },50);                
            

        

        return that;
    };
    
}());
