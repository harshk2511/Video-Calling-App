const socket = io("/");
const peer = new Peer();
let myVideoStream;
let myId;
//Chat
let username = "";
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const mainchatwindow = document.getElementById("mainchatwindow");
//
let currentPeer;
var videoGrid = document.getElementById("videoDiv");
var myvideo = document.createElement("video");
myvideo.muted = true;
const peerConnections = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideo(myvideo, stream);
    peer.on("call", (call) => {
      call.answer(stream);
      const vid = document.createElement("video");
      call.on("stream", (userStream) => {
        addVideo(vid, userStream);
        currentPeer = call.peerConnection;
      });
      call.on("error", (err) => {
        alert(err);
      });
      call.on("close", () => {
        console.log(vid);
        vid.remove();
      });
      peerConnections[call.peer] = call;
    });
  })
  .catch((err) => {
    alert(err.message);
  });
peer.on("open", (id) => {
  username = "";
  while (username == "") {
    username = prompt("What is your name?");
    if (username == "") alert("Please fill a name!");
  }
  myId = id;
  let li = document.createElement("li");
  li.innerHTML = "You joined!";
  all_messages.append(li);
  li.innerHTML = `Your room ID is: ${roomID}. <br> Invite your friends to join!`;
  all_messages.append(li)
  socket.emit("newUser", id, roomID, username);
});
peer.on("error", (err) => {
  alert(err.type);
});
socket.on("userJoined", (id, name) => {
  console.log("new user joined" + name);
  let li = document.createElement("li");
  li.innerHTML = `${name} joined the room!`;
  all_messages.append(li);
  const call = peer.call(id, myVideoStream);
  const vid = document.createElement("video");
  call.on("error", (err) => {
    alert(err);
  });
  call.on("stream", (userStream) => {
    addVideo(vid, userStream);
    currentPeer = call.peerConnection;
  });
  call.on("close", () => {
    vid.remove();
    console.log("user disconect");
  });
  peerConnections[id] = call;
});
socket.on("userDisconnect", (id, name) => {
  if (peerConnections[id]) {
    peerConnections[id].close();
    let li = document.createElement("li");
    li.innerHTML = `${name} left the room...`;
    all_messages.append(li);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.which === 13 && chatInputBox.value != "") {
    socket.emit("message", chatInputBox.value, username);
    chatInputBox.value = "";
  }
});
socket.on("createMessage", (msg, username) => {
  console.log(msg);
  let li = document.createElement("li");
  li.innerHTML = `${username}: ${msg}`;
  all_messages.append(li);
  //mainchatwindow.scrollTop = mainchatwindow.scrollHeight;
  //scrollToBottom();
});

const scrollToBottom = () => {
  var d = document.getElementById("mainchatwindow");
  d.scrollTop(d.prop("scrollHeight"));
};

let isAudioMuted = true;
function muteAudio() {
  isAudioMuted = !isAudioMuted;
  console.log("Is local video muted: " + isAudioMuted);
  myvideo.muted = isAudioMuted;
  if (isAudioMuted == false) {
    document.getElementById("muteaudio").style.color = "red";
    document.getElementById("muteaudiospan").textContent = "Mute Audio";
  } else {
    document.getElementById("muteaudio").style.color = "black";
    document.getElementById("muteaudiospan").textContent = "Unmute Audio";
  }
}

let isVideoOn = true;
function pauseVideo() {
  isVideoOn = !isVideoOn;
  console.log("Is Local Video on: " + isVideoOn);
  myVideoStream.getVideoTracks()[0].enabled = isVideoOn;
  if (isVideoOn == false) {
    document.getElementById("pausevideo").style.color = "red";
    document.getElementById("pausevideospan").textContent = "Resume Video";
  } else {
    document.getElementById("pausevideo").style.color = "black";
    document.getElementById("pausevideospan").textContent = "Pause Video";
  }
}

//let mystreamvideo = document.createElement("video");
function addVideo(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    video.muted = true;
  });
  videoGrid.append(video);
  mystreamvideo = video;
}

let check=true;
function leavemeeting() {
  if (check == true) {
    if (window.confirm("Leave Meeting?")) {
      window.close();
    }
  }
  socket.emit('disconnecteduser')
}

// var videoTrack;
// isScreenshareon = true;
// function startStopScreenshare() {
//   if (isScreenshareon) {
//     // mystream = document.createElement("video");
//     // mystream.controls = true;
//     // navigator.mediaDevices
//     //   .getDisplayMedia({
//     //     video: {
//     //       cursor: true,
          
//     //     },
//     //     audio: {
//     //       noiseSuppression: true,
//     //       echoCancellation: true,
//     //     },
//     //   })
//     //   .then((stream) => {
//     //     //videoTrack = stream.getVideoTracks()[0];
//     //     addVideo(mystream, stream);
//     //     videoTrack = stream;
//     //     peer.on("call", (call) => {
//     //       call.answer(stream);
//     //       const vid = document.createElement("video");
//     //       call.on("stream", (userStream) => {
//     //         addVideo(vid, userStream);
//     //         currentPeer = call.peerConnection;
//     //       });
//     //       call.on("error", (err) => {
//     //         alert(err);
//     //       });
//     //       call.on("close", () => {
//     //         console.log(vid);
//     //         vid.remove();
//     //       });
//     //       peerConnections[call.peer] = call;
//     //     });
//     //     stream.getVideoTracks()[0].onended = function () {
//     //       mystreamvideo.remove();
//     //       isScreenshareon = !isScreenshareon;
//     //       document.getElementById("screensharespan").textContent =
//     //         "Screenshare";
//     //       document.getElementById("screensharebtn").style.color = "black";
//     //     };
//     //   });
//     socket.emit("screensharetrigger", myId, username);
//     // document.getElementById("screensharespan").textContent = "Stop sharing";
//     // document.getElementById("screensharebtn").style.color = "red";
//   } else {
//     //problem - when we directly click stop screenshare, video is ending but screenshare is not
//     //videoTrack.onended = function () {
//       mystreamvideo.remove();
//       document.getElementById("screensharespan").textContent = "Screenshare";
//       document.getElementById("screensharebtn").style.color = "black";
//       //isScreenshareon = !isScreenshareon;
//     //}
//   }
//   isScreenshareon = !isScreenshareon;
//   console.log('isScreenshareOn: ' + isScreenshareon);
// }

// // socket.on("screenDisconnect", () => {});

// socket.on("screenJoined", (id, name) => {
//   console.log("new user joined" + name);
//   let li = document.createElement("li");
//   li.innerHTML = `${name} started screenshare!`;
//   all_messages.append(li);
//   mystream = document.createElement("video");
//     mystream.controls = true;
//     navigator.mediaDevices
//       .getDisplayMedia({
//         video: {
//           cursor: true,
          
//         },
//         audio: {
//           noiseSuppression: true,
//           echoCancellation: true,
//         },
//       })
//       .then((stream) => {
//         //videoTrack = stream.getVideoTracks()[0];
//         addVideo(mystream, stream);
//         videoTrack = stream;
//         peer.on("call", (call) => {
//           call.answer(stream);
//           const vid = document.createElement("video");
//           call.on("stream", (userStream) => {
//             addVideo(vid, userStream);
//             currentPeer = call.peerConnection;
//           });
//           call.on("error", (err) => {
//             alert(err);
//           });
//           call.on("close", () => {
//             console.log(vid);
//             vid.remove();
//           });
//           peerConnections[call.peer] = call;
//         });
//         stream.getVideoTracks()[0].onended = function () {
//           mystreamvideo.remove();
//           isScreenshareon = !isScreenshareon;
//           document.getElementById("screensharespan").textContent =
//             "Screenshare";
//           document.getElementById("screensharebtn").style.color = "black";
//         };
//       });
//       document.getElementById("screensharespan").textContent = "Stop sharing";
//       document.getElementById("screensharebtn").style.color = "red";
// });
