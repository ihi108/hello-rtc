import Janus from 'https://cdn.jsdelivr.net/npm/janus-gateway@1.3.0/+esm'

const opaqueId = username + meet_id;
let Plugin;
let localTracks = {}, remoteTracks = {};

Janus.init({
   debug: "all", 
   // dependencies: Janus.useDefaultDependencies(), //optional
   callback: function() {

      // Make sure the browser supports WebRTC
      if(!Janus.isWebrtcSupported()) {
         alert("No WebRTC support... ");
         return;
      }


      // Create session: represents the session with the server
      const janus = new Janus({
         server,
         iceServers,
         error: function(error) {
            // the session was not successfully created
            Janus.error(error)
            alert("The session was not created")
            window.location.reload()
         },
         destroyed: function() {
            // the session was destroyed and can't be used anymore
            window.location.reload()
         },
         success: function () {
            // application logic here
            // console.log('server=', janus.getServer())
            // console.log('janus-conntected=', janus.isConnected())
            // console.log('janus-session-id=', janus.getSessionId())

            // attach plugin to session
            janus.attach(
               {
                  plugin: "janus.plugin.videoroom",
                  opaqueId: opaqueId,
                  success: function(pluginHandle) {
                     console.log("Step1: success callback")
                     Plugin = pluginHandle;
                     Janus.log("Plugin attached! (" + Plugin.getPlugin() + ", id=" + Plugin.getId() + ")");

                     
                     if (!!create) {
                        // Negotiate WebRTC
                        let body = { 
                           audio: true,
                           video: true
                        };
                        Janus.debug("Trying a createOffer too (audio/video sendrecv)");
                        Plugin.createOffer(
                           {
                              tracks: [
                                 { type: 'audio', capture: true, recv: false },
                                 { type: 'video', capture: true, recv: false },
                                 { type: 'data' },
                              ],
                              success: function(jsep) {
                                 Janus.debug("Got SDP!", jsep);
                                 // Whether you use createOffer or createAnswer depending on the scenario, you should end up with a valid jsep object returned in the success callback. You can attach this jsep object to a message in a send request to pass it to the plugin, and have Janus negotiate a PeerConnection with your application.
                                 Plugin.send({ message: body, jsep: jsep });
                              },
                              error: function(error) {
                                 console.log(error)
                              }
                           }
                        )
                     }

                  },
                  error: function(error) {
                     console.log("Step2: error callback")

                  },
                  consentDialog: function(on) {
                     console.log("Step3: consentDialog callback")

                     // triggered just before getUserMedia and can be used to
                     // display UI to alert user on the need to allow permissions
                  },
                  webrtcState: function(on) {
                     console.log("Step4: webrtcState callback")

                  },
                  connectionState: function() {
                     console.log("Step5: connectionState callback")

                  },
                  iceState: function(state) {
                     console.log("Step6: iceState callback")

                  },
                  mediaState: function(medium, on, mid) {
                     console.log("Step7: mediaState callback")
                     // triggers when janus starts/stops receiving our media
                     Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium + " (mid=" + mid + ")");
                  },
                  slowLink: function() {
                     console.log("Step8: slowLink callback")

                  },
                  onmessage: function (msg, jsep) {
                     console.log("Step9: onmessage callback")
                  
                  },
                  onlocaltrack: function (track, on) {
                     //  a local MediaStreamTrack is available and ready to be displayed;
                     console.log("Step10: onlocaltrack callback")
                     Janus.debug("Local track " + (on ? "added" : "removed") + ":", track);

                     // We use the track ID as name of the element, but it may contain invalid characters
                     let trackId = track.id
                     console.log("trackId: ", trackId)
                     
                     // If we're here, a new track was added
                     let stream = localTracks[trackId];
                     if(stream) {
                        // We've been here already
                        return;
                     }
                    
                     if(track.kind === "audio") {
                        // We ignore local audio tracks, they'd generate echo anyway
                        // if(localVideos === 0) {
                        //    // No video, at least for now: show a placeholder
                        //    if($('#videoleft .no-video-container').length === 0) {
                        //       $('#videoleft').append(
                        //          '<div class="no-video-container">' +
                        //             '<i class="fa-solid fa-video fa-xl no-video-icon"></i>' +
                        //             '<span class="no-video-text">No webcam available</span>' +
                        //          '</div>');
                        //    }
                        // }
                     } else {
                        // New video track: create a stream out of it
                        let stream = new MediaStream([track]);
                        localTracks[trackId] = stream;
                        Janus.log("Created local stream:", stream);
                        Janus.attachMediaStream($('#setup-video').get(0), stream);
                     }
                  },
                  onremotetrack: function (track, mid, added, metadata) {
                     console.log("Step11: onremotetrack callback")

                     // a remote MediaStreamTrack is available and ready to be displayed
                     console.log("remote tracks event")
                  },
                  ondataopen: function () {
                     console.log("Step12: ondataopen callback")

                     // a Data Channel is available and ready to be used
                     console.log("data channel available")
                  },
                  ondata: function () {
                     console.log("Step13: ondata callback")

                     // data has been received through the Data Channel;
                     console.log("receiving data")
                  },
                  oncleanup: function() {
                     console.log("Step14: oncleanup callback")

                     // the WebRTC PeerConnection with the plugin was closed
                     console.log("closing peerconnection with plugin")
                  },
                  detached: function () {
                     console.log("Step15: detached callback")

                     // the plugin handle has been detached by the plugin itself, and so should not be used anymore.
                     console.log("plugin handle detached")
                  }
               }
            )

         }
      });
}});