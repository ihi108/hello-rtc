import Janus from 'https://cdn.jsdelivr.net/npm/janus-gateway@1.3.0/+esm'

let janus

const opaqueId = username + meet_id;
let videoRoomPlugin;
let localTracks = {}, remoteTracks = {};
let feeds = [], feedStreams = {}
let localStream;
let myid, mypvtid;
let constraints = {
   audio: { echoCancellation: true},
   video: true
}
window.constraints = constraints
let setupLocalStream;

const MAX_ROOM_SIZE = 4




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

      $("#room-endcall").on("click", function() {
         const leave = {
            request: "leave",
         }
         const unpublish = {
            request: "unpublish"
         }

         // to shutoff the camera
         videoRoomPlugin.send({
            message: unpublish,
         })


         videoRoomPlugin.send({
            message: leave,
         })
         for (let remoteFeed of feeds) {
            if (remoteFeed) {
               remoteFeed.detach();
            }
         }

         $("#room").addClass("hide")
         $("#leave").removeClass("hide")

      })

      $("#leave-return").on("click", function() {
         const form = document.createElement("form")
         form.action = "/"
         form.classList.add("hide")
         $("body").append(form)
         form.submit();
      })

      $("#leave-rejoin").on("click", function() {
         window.location.reload();
      })

      // Create session: represents the session with the server
      janus = new Janus({
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
                           if(msg["publishers"]) {
                              let publishers = msg["publishers"]
                              Janus.log("Got a list of available publishers/feeds:", publishers)

                              for(let publisher of publishers) {
                                 if(publisher.dummy) {
                                    continue;
                                 }
                                 let id = publisher.id // gets publisher id
                                 let streams = publisher.streams
                                 let display = publisher.display

                                 for(let i in streams) {
                                    let stream = streams[i]
                                    stream.id = id // add publisher id to stream
                                    stream.display = display
                                 }

                                 feedStreams.id = streams
                                 Janus.debug("  >> [" + id + "] " + display + ":", streams)

                                 // subscribe to remote publishers
                                 console.log("HANDLE REMOTE FEED ON JOIN SUCCESS")                                 
                                 newRemoteFeed(id, display, streams)
                              }
                           }
                           
                        }
                        else if(event === "destroyed")
                        {
                           // The room has been destroyed
                           Janus.warn("The room has been destroyed!")
                        }
                        else if(event === "event") {
                           // Any info on our streams or a new feed to attach to ?
                           if(msg["streams"]) {
                              let streams = msg["streams"]
                              for(let i in streams) {
                                 let stream = streams[i];
                                 stream.id = myid
                                 stream.display = username
                              }
                              feedStreams[myid] = streams
                           }
                           else if(msg["publishers"]) {
                              let publishers = msg["publishers"];
                              Janus.debug("Got a list of available publishers/feeds:", publishers);
                              for(let publisher of publishers) {
                                 if(publisher.dummy)
                                    continue;
                                 let id = publisher.id
                                 let display = publisher.display
                                 let streams = publisher.streams
                                 for(let i in streams) {
                                    let stream = streams[i];
                                    stream["id"] = id;
                                    stream["display"] = display;
                                 }
                                 feedStreams[id] = streams;
                                 Janus.debug("  >> [" + id + "] " + display + ":", streams);

                                 console.log("HANDLING REMOTE FEED ON REMOTE JOIN")
                                 newRemoteFeed(id, display, streams)
                              }
                           }
                           else if(msg["leaving"]) {
                              // One of the publishers has gone away?
                              let leaving = msg["leaving"];
                              Janus.log("Publisher left: " + leaving);
                              let remoteFeed = null;

                              // 2: is hard coded number of participants
                              for(let i=1; i<MAX_ROOM_SIZE; i++) {
                                 if(feeds[i] && feeds[i].rfid == leaving) {
                                    remoteFeed = feeds[i];
                                    break;
                                 }
                              }
                              if(remoteFeed) {
                                 Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");

                                 // remove remote feed video
                                 console.log("Removing remote feed video")
                                 // $('#remote'+remoteFeed.rfindex).empty().addClass('hide');
                                 // $('#videoremote'+remoteFeed.rfindex).empty();
                                 feeds[remoteFeed.rfindex] = null;
                                 remoteFeed.detach();
                              }
                              delete feedStreams[leaving];
                           }
                           else if(msg["unpublished"]) {
                              // One of the publishers has unpublished?
                              let unpublished = msg["unpublished"];
                              Janus.log("Publisher left: " + unpublished);
                              if(unpublished === 'ok') {
                                 // That's us
                                 videoRoomPlugin.hangup();
                                 return;
                              }
                              let remoteFeed = null;

                              // 2: hard coded value for number of participants
                              for(let i=1; i<MAX_ROOM_SIZE; i++) {
                                 if(feeds[i] && feeds[i].rfid == unpublished) {
                                    remoteFeed = feeds[i];
                                    break;
                                 }
                              }
                              if(remoteFeed) {
                                 Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");

                                 feeds[remoteFeed.rfindex] = null;
                                 remoteFeed.detach();
                              }
                              delete feedStreams[unpublished];
                           }
                           else if(msg["error"]) {
                              if(msg["error_code"] === 426) {
                                 // This is a "no such room" error: give a more meaningful description

                                 // bootbox.alert(
                                 //    "<p>Apparently room <code>" + myroom + "</code> (the one this demo uses as a test room) " +
                                 //    "does not exist...</p><p>Do you have an updated <code>janus.plugin.videoroom.jcfg</code> " +
                                 //    "configuration file? If not, make sure you copy the details of room <code>" + myroom + "</code> " +
                                 //    "from that sample in your current configuration file, then restart Janus and try again."
                                 // );
                              } else {
                                 console.error(msg["error"])
                              }
                           }
                        }
                     } 
                     if(jsep) {
                        Janus.debug("Handling SDP as well...", jsep);
                        Janus.log("Jsep from message callback")
                        videoRoomPlugin.handleRemoteJsep({ jsep: jsep });
                        // Check if any of the media we wanted to publish has
                        // been rejected (e.g., wrong or unsupported codec)
                        let audio = msg["audio_codec"];
                        if(localStream && localStream.getAudioTracks() && localStream.getAudioTracks().length > 0 && !audio) {
                           // Audio has been rejected
                           Janus.warn("Our audio stream has been rejected, viewers won't here us.")
                        }
                        let video = msg["video_codec"];
                        if(localStream && localStream.getVideoTracks() && localStream.getVideoTracks().length > 0 && !video) {
                           // Video has been rejected
                           Janus.warn("Our video stream has been rejected, viewers won't see us.")

                           // Hide the webcam video
                           // $('#myvideo').addClass('hide');
                           // $('#videolocal').prepend(
                           //    '<div class="no-video-container">' +
                           //       '<i class="fa-solid fa-video fa-xl no-video-icon" style="height: 100%;"></i>' +
                           //       '<span class="no-video-text" style="font-size: 16px;">Video rejected, no webcam</span>' +
                           //    '</div>');
                        }
   
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
                     // The publisher stream is sendonly, we don't expect anything here
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
      publishers: 4,
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
            
          
      
            for (let track of setupLocalStream.getTracks()) {
               track.stop()
            }
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
            console.log("Participants: ", participants)
            let count = 0
            let others = []
            for (let participant of participants) {
               others.push(participant["display"])
               count++
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
            for (let track of setupLocalStream.getTracks()) {
               track.stop()
            }
         })

      },
   })
}

// subscribes to new published feeds(streams)
function newRemoteFeed(id, display, streams) {
   // A new feed has been published, create a new plugin handle and attach to it as a subscriber
   let remoteFeed = null

   if(!streams) {
      streams = feedStreams[id];
   }

   janus.attach({
      plugin: "janus.plugin.videoroom",
      opaqueId: opaqueId,
      success: function(pluginHandle) {
         remoteFeed = pluginHandle
         // console.log("remoteFeedPlugin: ", remoteFeed)
         remoteFeed.remoteTracks = {}
         remoteFeed.remoteVideos = 0

         // read up on simulcast and svc

         Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")")
         Janus.log(" -- This is a subscriber");

         // Prepare the streams to subscribe to, as an array: we have the list of streams the feed is publishing, so we can choose what to pick or skip
         let subscription = []
         for(let i in streams) {
            let stream = streams[i]

            //If the publisher is VP8/VP9 and this is an older Safari, let's avoid video
            if(stream.type == "video" && Janus.webRTCAdapter.browserDetails.browser === "safari" && ((stream.codec === "vp9" && !Janus.safariVp9) || (stream.codec === "vp8" && !Janus.safariVp8))) {
               Janus.log("Publisher is using " + stream.codec.toUpperCase + ", but Safari doesn't support it: disabling video stream #" + stream.mindex)
               continue
            }

            subscription.push({
               feed: stream.id,
               mid: stream.mid
            })

            remoteFeed.rfid = stream.id;
            remoteFeed.rfdisplay = stream.display;
         }

         // We wait for the plugin to send us an offer
         let subscribe = {
            request: "join",
            room: Number(room),
            ptype: "subscriber",
            streams: subscription,
            // use_msid: use_msid,
            private_id: mypvtid
         }
         remoteFeed.send({ message: subscribe })
      },
      error: function(error) {
         Janus.error("  -- Error attaching plugin...", error);
      },
      iceState: function(state) {
         Janus.log("ICE state (feed #" + remoteFeed.rfindex + ") changed to " + state);
      },
      webrtcState: function(on) {
         Janus.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now");
      },
      slowLink: function(uplink, lost, mid) {
         Janus.warn("Janus reports problems " + (uplink ? "sending" : "receiving") +
            " packets on mid " + mid + " (" + lost + " lost packets)");
      },
      onmessage: function(msg, jsep) {
         Janus.debug(" ::: Got a message (subscriber) :::", msg);
         let event = msg["videoroom"];

         if(msg["error"]) {
            Janus.log("Subscription error")
         }
         else if(event) {
            if(event === "attached") {
               // Subscriber created and attached
               // 2: hard coded number of participants
               for(let i=1;i<MAX_ROOM_SIZE;i++) {
                  // loops through all the feeds and finds an empty index to attach the new remoteFeed
                  if(!feeds[i]) {
                     feeds[i] = remoteFeed;
                     // distinguishes the remoteFeeds being subscribed to
                     remoteFeed.rfindex = i;
                     break;
                  }
               }
               Janus.log("Successfully attached to feed in room " + msg["room"]);

               /**
                * on attaching to the publisher
                * 
                * create the remotefeed view with class of hidden
                */

               // investigate this 
               // $('#remote'+remoteFeed.rfindex).removeClass('hide').html(remoteFeed.rfdisplay).removeClass('hide');

               const remoteMedia = document.createElement('div')
               remoteMedia.className = "videos hide"
               remoteMedia.id = `remote${remoteFeed.rfindex}`
               $("#videos").append(remoteMedia)

            } else if(event === "event") {
               // Check if we got a simulcast-related event from this publisher
               let substream = msg["substream"];
               let temporal = msg["temporal"];
               // if((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
               //    if(!remoteFeed.simulcastStarted) {
               //       remoteFeed.simulcastStarted = true;
               //       // Add some new buttons
               //       addSimulcastSvcButtons(remoteFeed.rfindex, true);
               //    }
               //    // We just received notice that there's been a switch, update the buttons
               //    updateSimulcastSvcButtons(remoteFeed.rfindex, substream, temporal);
               // }


               // Or maybe SVC?
               let spatial = msg["spatial_layer"];
               temporal = msg["temporal_layer"];
               // if((spatial !== null && spatial !== undefined) || (temporal !== null && temporal !== undefined)) {
               //    if(!remoteFeed.svcStarted) {
               //       remoteFeed.svcStarted = true;
               //       // Add some new buttons
               //       addSimulcastSvcButtons(remoteFeed.rfindex, true);
               //    }
               //    // We just received notice that there's been a switch, update the buttons
               //    updateSimulcastSvcButtons(remoteFeed.rfindex, spatial, temporal);
               // }
            } else {
               // What has just happened?
               console.log("wtf WTF ??")
            }
         }

         if(jsep) {
            Janus.debug("Handling SDP as well...", jsep);
            let stereo = (jsep.sdp.indexOf("stereo=1") !== -1);
            // Answer and attach
            remoteFeed.createAnswer(
               {
                  jsep: jsep,
                  // We only specify data channels here, as this way in
                  // case they were offered we'll enable them. Since we
                  // don't mention audio or video tracks, we autoaccept them
                  // as recvonly (since we won't capture anything ourselves)
                  tracks: [
                     { type: 'data' }
                  ],
                  // customizeSdp: function(jsep) {
                  //    if(stereo && jsep.sdp.indexOf("stereo=1") == -1) {
                  //       // Make sure that our offer contains stereo too
                  //       jsep.sdp = jsep.sdp.replace("useinbandfec=1", "useinbandfec=1;stereo=1");
                  //    }
                  // },
                  success: function(jsep) {
                     Janus.debug("Got SDP!", jsep);
                     let body = { request: "start", room: Number(room) };
                     remoteFeed.send({ message: body, jsep: jsep });
                  },
                  error: function(error) {
                     // not just logging. handle the error properly for users sake
                     Janus.error("WebRTC error:", error);
                  }
               }
            );
         }
      },
      onlocaltrack: function(track, on) {
         // The subscriber stream is recvonly, we don't expect anything here
      },
      onremotetrack: function(track, mid, on, metadata) {
         Janus.debug(
            "Remote feed #" + remoteFeed.rfindex +
            ", remote track (mid=" + mid + ") " +
            (on ? "added" : "removed") +
            (metadata? " (" + metadata.reason + ") ": "") + ":", track
         );

         

         if(!on) {
            // Track removed, get rid of the stream and the rendering

            console.log("GETTING RID OF TRACK for user: " + remoteFeed.rfdisplay)

            // $('#remotevideo'+remoteFeed.rfindex + '-' + mid).remove();
            // if(track.kind === "video") {
            //    /**
            //     * when a user mutes their video
            //     * handle by displaying content to show that there is no video
            //     */
            //    remoteFeed.remoteVideos--;
            //    if(remoteFeed.remoteVideos === 0) {
            //       // No video, at least for now: show a placeholder
            //       if($('#videoremote'+remoteFeed.rfindex + ' .no-video-container').length === 0) {
            //          $('#videoremote'+remoteFeed.rfindex).append(
            //             '<div class="no-video-container">' +
            //                '<i class="fa-solid fa-video fa-xl no-video-icon"></i>' +
            //                '<span class="no-video-text">No remote video available</span>' +
            //             '</div>');
            //       }
            //    }
            // }
            delete remoteFeed.remoteTracks[mid];
            return;
         }

         
         // If we're here, a new track was added
         if($('#remote' + remoteFeed.rfindex + '-' + mid).length > 0) {
            return;
         }
         
         

         if(track.kind === "audio") {
            // New audio track: create a stream out of it, and use a hidden <audio> element
            let stream = new MediaStream([track]);
            remoteFeed.remoteTracks[mid] = stream;

            Janus.log("Created remote audio stream:", stream);

            $('#remote'+remoteFeed.rfindex).append('<audio class="hide" id="remote' + remoteFeed.rfindex + '-' + mid + '" autoplay playsinline/>');


            Janus.attachMediaStream($(`#remote${remoteFeed.rfindex}-${mid}`).get(0), stream);

            if(remoteFeed.remoteVideos === 0) {
               // No video, at least for now: show a placeholder
               // if($('#videoremote'+remoteFeed.rfindex + ' .no-video-container').length === 0) {
               //    $('#videoremote'+remoteFeed.rfindex).append(
               //       '<div class="no-video-container">' +
               //          '<i class="fa-solid fa-video fa-xl no-video-icon"></i>' +
               //          '<span class="no-video-text">No remote video available</span>' +
               //       '</div>');
               // }
            }
         } else {
            // New video track: create a stream out of it
            remoteFeed.remoteVideos++;

            let stream = new MediaStream([track]);
            remoteFeed.remoteTracks[mid] = stream;


            Janus.log("Created remote video stream:", stream);

            // creates video element and appends to DOM
            console.log("CREATE VIDEO ELEMENT AND APPEND TO DOM")
            $(`#remote${remoteFeed.rfindex}`).removeClass("hide")
            $('#remote'+remoteFeed.rfindex).append('<video id="remote' + remoteFeed.rfindex + '-' + mid + '" autoplay playsinline/>');
            Janus.attachMediaStream($(`#remote${remoteFeed.rfindex}-${mid}`).get(0), stream);


            // Note: we'll need this for additional videos too
            // if(!bitrateTimer[remoteFeed.rfindex]) {
            //    $('#curbitrate'+remoteFeed.rfindex).removeClass('hide').removeClass('hide');
            //    bitrateTimer[remoteFeed.rfindex] = setInterval(function() {
            //       if(!$("#videoremote" + remoteFeed.rfindex + ' video').get(0))
            //          return;
            //       // Display updated bitrate, if supported
            //       let bitrate = remoteFeed.getBitrate();
            //       $('#curbitrate'+remoteFeed.rfindex).text(bitrate);
            //       // Check if the resolution changed too
            //       let width = $("#videoremote" + remoteFeed.rfindex + ' video').get(0).videoWidth;
            //       let height = $("#videoremote" + remoteFeed.rfindex + ' video').get(0).videoHeight;
            //       if(width > 0 && height > 0) {
            //          let res = width + 'x' + height;
            //          if(remoteFeed.simulcastStarted)
            //             res += ' (simulcast)';
            //          else if(remoteFeed.svcStarted)
            //             res += ' (SVC)';
            //          $('#curres'+remoteFeed.rfindex).removeClass('hide').text(res).removeClass('hide');
            //       }
            //    }, 1000);
            // }
         }

      },
      oncleanup: function() {
         // cleanup actions for the particular subscriber
         Janus.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");

         $(`#remote${remoteFeed.rfindex}`).remove();
         remoteFeed.remoteTracks = {};
         remoteFeed.remoteVideos = 0;
      }
   })
}