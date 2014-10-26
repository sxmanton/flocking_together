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

        that.editor = Firepad.fromCodeMirror(firepadRef, codeMirror);
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

            
            

    function getPlaying(that) {
        that.eventsRef.once('value', function(snapshot) {
            that.playing = snapshot.child('playing').val();
            console.log(that.playing);
        });
    }

    var setupLoadControls = function (that) {
        $(that.selectors.loadButton).click(that.loadSelectedDemo);

        // Automatically load the demo whenever the demo menu changes.
        $(that.selectors.demosMenu).change(that.loadSelectedDemo);
    };

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

    demo.liveEditorView = function (editorId, selectors) {
        selectors = selectors || {
            playButton: ".playButton"
        };

        var that = {
            editor: null,
            isPlaying: false,
            playButton: $(selectors.playButton),
            selectors: selectors
        };

        setupEditor(that, editorId);
        setupPlayButton(that);
        setupLoadControls(that);
        that.simulated = false;        

        that.eventsRef.on('child_changed',function(snapshot){
            getPlaying(that);           
            if (that.playing) { // && !flock.enviro.shared.model.isPlaying
                playBack(that);
            } else {
                pauseBack(that);
            }
        });
        return that;
    };

}());
