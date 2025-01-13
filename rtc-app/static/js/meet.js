import Janus from 'https://cdn.jsdelivr.net/npm/janus-gateway@1.3.0/+esm'

const opaqueId = username + meet_id;
let videoRoomPlugin;
let localTracks = {}, remoteTracks = {};
let localStream;
let myid, mypvtid;
let constraints = {
   audio: { echoCancellation: true},
   video: true
}
window.constraints = constraints
let setupLocalStream;




Janus.init({debug: "all", callback: function() {

   // Make sure the browser supports WebRTC
   if(!Janus.isWebrtcSupported()) {
      alert("No WebRTC support... ");
      return;
   }


   navigator.mediaDevices.getUserMedia(constraints)
   .then(stream => {
      setupLocalStream = stream
      $("#permission-text").remove()
      $("#setup-video").get(0).srcObject = stream;
      $("#setup-mic").removeAttr("disabled")
      $("#setup-camera").removeAttr("disabled")
      $("#setup-join").removeAttr("disabled")

      $("#setup-mic").on("click", function(e) {
         let mute = $(this).data("mute")

         if (mute) {
            $(this).data("mute", false)
            $(this).html(`<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/></svg>`)
            $(this).removeClass("muted")
            constraints.audio = true
            setupLocalStream.getAudioTracks()[0].enabled = true;

         } else {
            $(this).data("mute", true)
            $(this).html(`<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="m710-362-58-58q14-23 21-48t7-52h80q0 44-13 83.5T710-362ZM480-594Zm112 112-72-72v-206q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v126l-80-80v-46q0-50 35-85t85-35q50 0 85 35t35 85v240q0 11-2.5 20t-5.5 18ZM440-120v-123q-104-14-172-93t-68-184h80q0 83 57.5 141.5T480-320q34 0 64.5-10.5T600-360l57 57q-29 23-63.5 39T520-243v123h-80Zm352 64L56-792l56-56 736 736-56 56Z"/></svg>`)
            $(this).addClass("muted")
            setupLocalStream.getAudioTracks()[0].enabled = false;
            constraints.audio = false
         }
      })
      
      $("#setup-camera").on("click", function() {
         let mute = $(this).data("mute")

         if (mute) {
            $(this).data("mute", false)
            $(this).html(`<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h480q33 0 56.5 23.5T720-720v180l160-160v440L720-420v180q0 33-23.5 56.5T640-160H160Zm0-80h480v-480H160v480Zm0 0v-480 480Z"/></svg>`)
            $(this).removeClass("muted")
            constraints.video = true
            $("#avatar").addClass("hide")
            setupLocalStream.getVideoTracks()[0].enabled = true;

         } else {
            $(this).data("mute", true)
            $(this).html(`<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M880-260 720-420v67l-80-80v-287H353l-80-80h367q33 0 56.5 23.5T720-720v180l160-160v440ZM822-26 26-822l56-56L878-82l-56 56ZM498-575ZM382-464ZM160-800l80 80h-80v480h480v-80l80 80q0 33-23.5 56.5T640-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800Z"/></svg>`)
            $(this).addClass("muted")
            constraints.video = false
            $("#avatar").removeClass("hide")
            setupLocalStream.getVideoTracks()[0].enabled = false;
         }
      })

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
   
            // attach plugin to session
            janus.attach(
               {
                  plugin: "janus.plugin.videoroom",
                  opaqueId: opaqueId,
                  success: function(pluginHandle) {
                     console.log("Step1: success callback")
                     videoRoomPlugin = pluginHandle;
                     Janus.log("Plugin attached! (" + videoRoomPlugin.getPlugin() + ", id=" + videoRoomPlugin.getId() + ")");
   
                     
                     if (create) {
                        let exists = {
                           "request" : "exists",
                           "room" : Number(room)
                        }
                        videoRoomPlugin.send({
                           message: exists,
                           success: function(response) {
                              let exists = response["exists"]
                              if (exists) {
                                 
                                 roomExists()
                              } else {
                                 Janus.log(`Creating room: ${room}`)
                                 roomNotExists()
                              }
                           },
                        });
   
                     } else {
                        Janus.log(`Joining room: ${room}`)
                        roomExists()
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
                     console.log("Step8: onmessage")
                     Janus.debug(" ::: Got a message (publisher) :::", msg);
                     let event = msg["videoroom"];
                     Janus.debug("Event: " + event);
                     console.log("Onmessage; msg: " + JSON.stringify(msg, null, 2))
                     if(event) {
                        if(event === "joined") {
                           // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
                           myid = msg["id"];
                           mypvtid = msg["private_id"];
                           Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);
   
   
                           // Any new feed to attach to?
                           // If you are joining and there are active publishers
                           
                        }
                     } 
                     if(jsep) {
                        Janus.debug("Handling SDP as well...", jsep);
                        videoRoomPlugin.handleRemoteJsep({ jsep: jsep });
                        // Check if any of the media we wanted to publish has
                        // been rejected (e.g., wrong or unsupported codec)
                        // let audio = msg["audio_codec"];
                        // if(mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
                        //    // Audio has been rejected
                        //    toastr.warning("Our audio stream has been rejected, viewers won't hear us");
                        // }
                        // let video = msg["video_codec"];
                        // if(mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
                        //    // Video has been rejected
                        //    toastr.warning("Our video stream has been rejected, viewers won't see us");
                        //    // Hide the webcam video
                        //    $('#myvideo').addClass('hide');
                        //    $('#videolocal').prepend(
                        //       '<div class="no-video-container">' +
                        //          '<i class="fa-solid fa-video fa-xl no-video-icon" style="height: 100%;"></i>' +
                        //          '<span class="no-video-text" style="font-size: 16px;">Video rejected, no webcam</span>' +
                        //       '</div>');
                        // }
   
                        console.log("Jsep from message callback")
                     }
                     
                  },
                  onlocaltrack: function (track, on) {
                     //  a local MediaStreamTrack is available and ready to be displayed;
                     console.log("Step9: onlocaltrack")
                     console.log(`onlocaltrack; track: ${track}, on: ${on}`)
                     Janus.debug("Local track " + (on ? "added" : "removed") + ":", track);
                     let trackId = track.id.replace(/[{}]/g, "");
                     if(!on) {
                        // Track removed, get rid of the stream and the rendering
                        let stream = localTracks[trackId];
                        if(stream) {
                           try {
                              let tracks = stream.getTracks();
                              for(let i in tracks) {
                                 let mst = tracks[i];
                                 if(mst !== null && mst !== undefined)
                                    mst.stop();
                              }
                           // eslint-disable-next-line no-unused-vars
                           } catch(e) {}
                        }
                        if(track.kind === "video") {
                           if(localVideos === 0) {
                              // No video, at least for now: show a placeholder
                              console.log("No video for now ...")
                           }
                        }
                        delete localTracks[trackId];
                        return;
                     }
                     // If we're here, a new track was added
                     let stream = localTracks[trackId];
                     if(stream) {
                        // We've been here already
                        return;
                     }
                     
                     if(track.kind === "audio") {
                        // We ignore local audio tracks, they'd generate echo anyway
                     } else {
                        // New video track: create a stream out of it
                        stream = new MediaStream([track]);
                        localTracks[trackId] = stream;
                        Janus.log("Created local stream:", stream);
                        Janus.log(stream.getTracks());
                        Janus.log(stream.getVideoTracks());
                        localStream = stream
                        Janus.attachMediaStream($('#local-video').get(0), stream);
                     }
                     if(videoRoomPlugin.webrtcStuff.pc.iceConnectionState !== "completed" &&
                           videoRoomPlugin.webrtcStuff.pc.iceConnectionState !== "connected") {
                        // $("#videolocal").parent().parent().block({
                        //    message: '<b>Publishing...</b>',
                        //    css: {
                        //       border: 'none',
                        //       backgroundColor: 'transparent',
                        //       color: 'white'
                        //    }
                        // });
                        console.log("Publishing...")
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
   }) 
   .catch(error => {
      console.log(error)
   })

}});





function roomNotExists() {
   $("#who-is-here").text("no one is here...")

   let create = {
      request: "create",
      room: Number(room),
      publishers: 2,
      bitrate: 128000,
   }
   videoRoomPlugin.send({ 
      message: create,
      success: function(response) {
         $("#setup-join").on("click", function(event) {
            Janus.log(`Joining room: ${room}`);
            
            let joinAndConfigure = {
               request: "joinandconfigure",
               room: Number(room),
               ptype: "publisher",
               display: username
            }

            videoRoomPlugin.createOffer({
               tracks: [
                  { type: 'audio', capture: constraints.audio, recv: false },
                  { type: 'video', capture: constraints.video, recv: false },
                  // { type: 'data' },
               ],
               success: function(jsep) {
                  // Got our SDP! Send our OFFER to the plugin
                  videoRoomPlugin.send({ 
                     message: joinAndConfigure,
                     jsep: jsep 
                  });

                  
               },
               error: function(error) {
                  Janus.debug("Some error", error);
               }
            })
            
          
      
            $("#room").removeClass("hide")
            $("#setup").addClass("hide")
         })
      }
   })
}

function roomExists() {

   Janus.log(`room: ${room}, exists`)


   let listparticipants = {
      request: "listparticipants",
      room: Number(room)
   }

   videoRoomPlugin.send({
      message: listparticipants,
      success: function(response) {
         const participants = response["participants"]
         if (participants.length == 0) {
            $("#who-is-here").text("no one is here...")
         } else {
            // list a few of the participants
            let count = 0
            let others = []
            for (let participant of participants) {
               others.push(participant["display"])
               if (count == 5) {
                  break
               }
            }
            const all = others.join(",") + "..." + ((others.length > 1) ? "are here!" : "is here!")
            $("#who-is-here").text(all)
         }

         $("#setup-join").on("click", function(event) {
            Janus.log(`Joining room: ${room}`);
            

            let joinAndConfigure = {
               request: "joinandconfigure",
               room: Number(room),
               ptype: "publisher",
               display: username
            }
   
            videoRoomPlugin.createOffer({
               tracks: [
                  { type: 'audio', capture: constraints.audio, recv: false },
                  { type: 'video', capture: constraints.video, recv: false },
                  // { type: 'data' },
               ],
               success: function(jsep) {
                  // Got our SDP! Send our OFFER to the plugin
                  videoRoomPlugin.send({ 
                     message: joinAndConfigure,
                     jsep: jsep 
                  });
   
                  
               },
               error: function(error) {
                  Janus.debug("Some error", error);
               }
            })
          
      
            $("#room").removeClass("hide")
            $("#setup").addClass("hide")
         })

      },
   })
}