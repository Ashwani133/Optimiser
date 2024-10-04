const lenis = new Lenis()

lenis.on('scroll', (e) => {
  console.log(e)
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

let tl = gsap.timeline({
    scrollTrigger:{
        trigger:".second-page",
        start:"10% 50%",
        end: "100% 50%",
        // markers:true,
        scrub:1,
    }
})

tl.to(".text-area-hover h1", {
    width: "100%",  // Ensure "100%" is a string with units
    duration: 2    // Optional: add a duration for the animation
});

tl.to(".text-area-hover h2", {
    width: "100%",  // Ensure "100%" is a string with units
    duration: 1    // Optional: add a duration for the animation
});
