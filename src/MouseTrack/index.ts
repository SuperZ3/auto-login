import { writeFileSync } from "fs";

const MouseTrack = [
    {
        "x": 181,
        "y": 411
    },
    {
        "x": 180,
        "y": 388
    },
    {
        "x": 179,
        "y": 384
    },
    {
        "x": 181,
        "y": 384
    },
    {
        "x": 194,
        "y": 384
    },
    {
        "x": 203,
        "y": 383
    },
    {
        "x": 214,
        "y": 383
    },
    {
        "x": 216,
        "y": 383
    },
    {
        "x": 240,
        "y": 383
    },
    {
        "x": 240,
        "y": 383
    },
    {
        "x": 270,
        "y": 383
    },
    {
        "x": 274,
        "y": 384
    },
    {
        "x": 288,
        "y": 386
    },
    {
        "x": 298,
        "y": 386
    },
    {
        "x": 306,
        "y": 386
    },
    {
        "x": 312,
        "y": 386
    },
    {
        "x": 325,
        "y": 387
    },
    {
        "x": 327,
        "y": 387
    },
    {
        "x": 329,
        "y": 387
    },
    {
        "x": 331,
        "y": 387
    },
    {
        "x": 333,
        "y": 387
    },
    {
        "x": 336,
        "y": 388
    },
    {
        "x": 342,
        "y": 389
    },
    {
        "x": 359,
        "y": 393
    },
    {
        "x": 371,
        "y": 395
    },
    {
        "x": 369,
        "y": 395
    }
]
export default MouseTrack;
// const track = []

// function recordTrack(e) {
//     track.push({
//         x: e.clientX,
//         y: e.clientY,
//     })
// };
// const target = document.querySelector(".JDJRV-slide-inner.JDJRV-slide-btn");
//     target?.addEventListener("mousemove", throttle(recordTrack, 10));
// function throttle(fn, delay) {
//     var previous = 0;
//     return function() {
//         var _this = this;
//         var args = arguments;
//         var now = new Date();
//         if(now - previous > delay) {
//             fn.apply(_this, args);
//             previous = now;
//         }
//     }
// };

let trajectory = []

for (let i = 1; i < MouseTrack.length; i++) {
    const prev = MouseTrack[i - 1]
    const current = MouseTrack[i]
    trajectory[i] = {
        x: current["x"] - prev["x"],
        y: current["y"] - prev["y"]
    }
}
writeFileSync("./trajectory.js", JSON.stringify(trajectory), "utf-8")

