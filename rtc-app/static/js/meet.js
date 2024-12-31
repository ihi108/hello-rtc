import Janus from 'https://cdn.jsdelivr.net/npm/janus-gateway@1.3.0/+esm'

Janus.init({debug: "all", callback: function() {
   console.log("Initialization success");
}});