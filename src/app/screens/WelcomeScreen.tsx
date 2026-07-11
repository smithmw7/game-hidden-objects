import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { completeOnboarding } from "../../platform/storage/playerProgress";
import { duration, gsap, motionDuration, motionEase, useGSAP } from "../../motion/gsap";

export function WelcomeScreen() {
  const rootRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();

  useGSAP(() => {
    gsap.from([".welcome-copy > *", ".welcome-actions"], {
      y: 18,
      autoAlpha: 0,
      stagger: 0.08,
      duration: duration(motionDuration.expressive),
      ease: motionEase.settle
    });
  }, { scope: rootRef });

  return (
    <section ref={rootRef} className="welcome-screen">
      <div className="welcome-art" aria-hidden="true"><img src="content/level-001/scene.png" alt="" /></div>
      <div className="welcome-card">
        <div className="welcome-copy">
          <p className="eyebrow">A quiet observation game</p>
          <h1>Look closely.</h1>
          <p>Settle into richly detailed scenes and find the small stories hiding in plain sight.</p>
        </div>
        <div className="welcome-actions">
          <div className="welcome-tip"><span>01</span><p>Explore the scene at your own pace.</p></div>
          <div className="welcome-tip"><span>02</span><p>Tap each object when you find it.</p></div>
          <button className="button" type="button" onClick={async () => { await completeOnboarding(); navigate("/levels"); }}>Begin</button>
        </div>
      </div>
    </section>
  );
}
