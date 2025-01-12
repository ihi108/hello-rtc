import Janus from 'https://cdn.jsdelivr.net/npm/janus-gateway@1.3.0/+esm'

const opaqueId = username + meet_id;
let videoRoomPlugin;
let localTracks = {}, remoteTracks = {};
let localStream;
let myid, mypvtid;
console.log(room)

Janus.init({debug: "all", callback: function() {

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
                              Janus.log(`room: ${room}, exists`)
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
                  if (msg) {
                     console.log("msg: ", msg)
                  }

                  if (jsep) {
                     console.log("Jsep: ", jsep)
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
                     Janus.attachMediaStream($('#setup-video').get(0), stream);
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
}});





function roomNotExists() {
   $("#who-is-here").text("no one is here...")

   let create = {
      request: "create",
      room: Number(room),
      publishers: 2,
      bitrate: 128000,
   }


   videoRoomPlugin.createOffer({
      tracks: [
         { type: 'audio', capture: true, recv: false },
         { type: 'video', capture: true, recv: false },
         // { type: 'data' },
      ],
      success: function(jsep) {
         // Got our SDP! Send our OFFER to the plugin
         videoRoomPlugin.send({ 
            message: create,
            success: function(respone) {
               console.log(respone)
            },
            jsep: jsep 
         });
      },
      error: function(error) {
         Janus.debug("Some error", error);
      }
   })

   $("#setup-join").on("click", function(event) {
      Janus.log(`Joining room: ${room}`);
      
      let join = {
         request: "join",
         room: Number(room),
         ptype: "publisher",
         display: username
      }
      
      videoRoomPlugin.send({ 
         message: join,
         success: function(response) {
            console.log(response)
         }
      })
      
      $("#room").removeClass("hide")
      console.log("Attaching local stram on click")
      Janus.attachMediaStream($('#local-video').get(0), localStream);
      $("#setup").addClass("hide")
   })
}

function roomExists() {

   videoRoomPlugin.createOffer({
      tracks: [
         { type: 'audio', capture: true, recv: false },
         { type: 'video', capture: true, recv: false },
         // { type: 'data' },
      ],
      success: function(jsep) {
         // Got our SDP! Send our OFFER to the plugin

         // videoRoomPlugin.handleRemoteJsep({ jsep: jsep });

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
                  console.log("Participants: ", participants)
                  let count = 0
                  let others = []
                  for (let participant of participants) {
                     others.push(participant["display"])
                     if (count == 5) {
                        break
                     }
                  }
                  console.log("others", others)
                  const all = others.join(",") + "..." + ((others.length > 1) ? "are here!" : "is here!")
                  $("#who-is-here").text(all)
               }
            },
            jsep: jsep
         })


         $("#setup-join").on("click", function(event) {
            Janus.log(`Joining room: ${room}`);
            
            let join = {
               request: "join",
               room: Number(room),
               ptype: "publisher",
               display: username
            }
            
            videoRoomPlugin.send({ 
               message: join,
               success: function() {
                  const publish = {
                     request: "publish",
                     display: username
                  }

                  videoRoomPlugin.send({
                     message: publish,
                     success: function(response) {
                        console.log("Publish response: ", response)
                     }
                  })
               }
            })
            
            $("#room").removeClass("hide")
            console.log("Attaching local stram on click")
            Janus.attachMediaStream($('#local-video').get(0), localStream);
            $("#setup").addClass("hide")
         })
      },
      error: function(error) {
         Janus.debug("Some error", error);
      }
   })
}