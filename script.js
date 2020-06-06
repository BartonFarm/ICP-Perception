  function throttle(callback, wait, immediate = false) {
    let timeout = null
    let initialCall = true
    return function() {
        const callNow = immediate && initialCall
        const next = () => {
            callback.apply(this, arguments)
            timeout = null
        }
        if (callNow) {
            initialCall = false
            next()
        }

        if (!timeout) {
            timeout = setTimeout(next, wait)
        }
    }
}

let clicks = 0;
document.addEventListener("click", () => {
  clicks++
})
window.webgazer.setRegression("ridge"); //set a regression module

let averageWindow = []

window.webgazer.setGazeListener(throttle(function(data, elapsedTime) {
    if (data == null) {
        return;
    }
    if (clicks < 20) return
    averageWindow.unshift({x: data.x, y: data.y})
    averageWindow = averageWindow.slice(0,10)
    const [xsum, ysum] = averageWindow.reduce(([xp,yp],{x, y}) => {
      return [xp+x, yp+y]
    }, [0,0])
    var xprediction = xsum/averageWindow.length; //these x coordinates are relative to the viewport
    var yprediction = ysum/averageWindow.length; //these y coordinates are relative to the viewport
    const dot = document.querySelector(".dot")
    dot.style.left = xprediction + "px"
    dot.style.top = yprediction + "px"
    const pctRight = xprediction / window.innerWidth
    const pctBottom = yprediction / window.innerHeight
    Array.from(document.querySelectorAll(".frame")).forEach(div => {
      div.style.display = "none"
    })
    if (pctRight < 0.33 && pctBottom > 0.25 && pctBottom < 0.75){
        document.querySelector(".left").style.display = "block"
    } else if (pctRight > 0.66 && pctBottom > 0.25 && pctBottom < 0.75){
        document.querySelector(".right").style.display = "block"
    } else if (pctBottom <= 0.25) {
        document.querySelector(".top").style.display = "block"
    } else if (pctBottom >= 0.75) {
        document.querySelector(".bottom").style.display = "block"
    }

})).begin();
