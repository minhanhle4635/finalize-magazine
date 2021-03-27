function myFunction() {
    var x = document.getElementById("navi");
    if (x.className === "main-nav") {
      x.className += "rp";
    } else {
      x.className = "main-nav";
    }
  }