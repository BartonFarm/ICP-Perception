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
document.querySelector(".screen").addEventListener("click", () => {
  clicks++
})
window.webgazer.setRegression("ridge"); //set a regression module

let averageWindow = []
let last = null
let current = null
let lock = false

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

    if (pctRight < 0.4 && pctBottom < 0.4){
        current = "ul"
    } else if (pctRight > 0.6 && pctBottom < 0.4){
        current = "ur"
    } else if (pctRight < 0.4 && pctBottom > 0.6) {
        current = "ll"
    } else if (pctRight > 0.6 && pctBottom > 0.6){
        current = "lr"
    } else {
        current = "default"
    }
    
    if(lock) return
    if(current === last) {
        last = current
    } else {
        lock = true
        setTimeout(() => {
            lock = false
        }, 1000)
        Array.from(document.querySelectorAll("iframe")).forEach(div => {
            div.style.opacity = "0"
        })
        Array.from(document.querySelectorAll("." + current)).forEach(div => {
            div.style.opacity = "1"
        })
        last = current
    }

    

})).begin();
