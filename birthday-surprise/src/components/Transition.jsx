import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './Transition.css'

export default function Transition({ onComplete }) {
    const containerRef = useRef(null)
    const textRef = useRef(null)
    const progressRef = useRef(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.to(containerRef.current, {
                        opacity: 0,
                        duration: 0.6,
                        ease: 'power2.in',
                        onComplete,
                    })
                },
            })

            // Fade in
            tl.from(containerRef.current, {
                opacity: 0,
                duration: 0.5,
            })

            // Animate gift icon
            tl.from('.gift-icon', {
                scale: 0,
                rotation: -180,
                duration: 0.8,
                ease: 'back.out(1.7)',
            })

            // Animate text lines
            tl.from('.transition-line', {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.15,
                ease: 'power3.out',
            }, '-=0.3')

            // Animate progress bar
            tl.to(progressRef.current, {
                width: '100%',
                duration: 2.5,
                ease: 'power1.inOut',
            }, '-=0.2')

            // Pulse the gift
            tl.to('.gift-icon', {
                scale: 1.3,
                duration: 0.3,
                ease: 'power2.out',
                yoyo: true,
                repeat: 1,
            }, '-=0.5')

        }, containerRef)

        return () => ctx.revert()
    }, [onComplete])

    return (
        <div className="transition-screen" ref={containerRef}>
            <div className="transition-glow" />

            <div className="transition-center" ref={textRef}>
                <div className="gift-icon">🎁</div>
                <h2 className="transition-line">Unwrapping something special...</h2>
                <p className="transition-line">Just for you</p>

                <div className="progress-track-transition">
                    <div className="progress-bar-fill" ref={progressRef} />
                </div>
            </div>
        </div>
    )
}
