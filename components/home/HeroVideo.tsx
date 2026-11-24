"use client";

export default function HeroVideo() {
  // const videoRef = useRef<HTMLVideoElement>(null);

  // useEffect(() => {
  //   const video = videoRef.current;
  //   if (!video) return;
  //
  //   let cancelled = false;
  //
  //   const unmute = () => {
  //     video.muted = false;
  //     video.volume = 1;
  //     void video.play().catch(() => {});
  //   };
  //
  //   video.muted = false;
  //   video.volume = 1;
  //
  //   void video.play().catch(() => {
  //     if (cancelled) return;
  //     video.muted = true;
  //     void video.play().catch(() => {});
  //     window.addEventListener("pointerdown", unmute, { once: true });
  //   });
  //
  //   return () => {
  //     cancelled = true;
  //     window.removeEventListener("pointerdown", unmute);
  //   };
  // }, []);

  return (
    <video
      // ref={videoRef}
      className="aspect-video w-full object-contain"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-label="What you seek is seeking you"
    >
      <source src="/video/rrVideo.mp4" type="video/mp4" />
    </video>
  );
}
