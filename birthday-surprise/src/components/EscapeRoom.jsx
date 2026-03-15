import { useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import confetti from 'canvas-confetti'
import './EscapeRoom.css'

const questions = [
    {
        id: 1,
        badge: 'Memory I',
        emoji: '🌸',
        title: 'The Name That Stayed',
        subtitle: 'Class 10th feels like yesterday...',
        question: 'Remember that name you used to call me?',
        hint: 'It starts with B...',
        answers: ['Bhondu', 'bhondu'],
        emotionalResponse: 'You remembered! That name carries so many memories... 💕',
    },
    {
        id: 2,
        badge: 'Memory II',
        emoji: '🐾',
        title: 'The Great Escape',
        subtitle: 'Latest Slang......',
        question: 'The latest slang you made and was very pround of it that you told aunty?',
        answers: ['gand ki ched', 'gandkiched'],
        emotionalResponse: 'Weirdo----------',
    },
    {
        id: 3,
        badge: 'Memory III',
        emoji: '☕',
        title: 'Bangalore Diaries',
        subtitle: 'The city of gardens and good vibes...',
        question: 'When you were in Bangalore, there was this one drink you couldn\'t stop having. What was your favourite?',
        hint: 'Warm, aromatic, and the soul of every morning ☕',
        answers: ['coffee', 'filter coffee', 'kaapi', 'cappuccino', 'latte'],
        emotionalResponse: 'Of course it was! You and your coffee... some things never change ☕💛',
    },
]

export default function EscapeRoom({ onComplete }) {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answer, setAnswer] = useState('')
    const [error, setError] = useState(false)
    const [showResponse, setShowResponse] = useState(false)
    const [completed, setCompleted] = useState(false)

    const containerRef = useRef(null)
    const cardRef = useRef(null)
    const headerRef = useRef(null)
    const particlesRef = useRef(null)
    const inputRef = useRef(null)

    // Entrance animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate floating particles
            gsap.to('.particle', {
                y: 'random(-100, 100)',
                x: 'random(-50, 50)',
                opacity: 'random(0.1, 0.5)',
                duration: 'random(3, 6)',
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: {
                    each: 0.3,
                    from: 'random',
                },
            })

            // Header entrance
            const tl = gsap.timeline()
            tl.from('.escape-header-line', {
                y: 40,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
                stagger: 0.15,
            })
            tl.from('.question-card', {
                y: 60,
                opacity: 0,
                scale: 0.95,
                duration: 0.8,
                ease: 'power3.out',
            }, '-=0.3')
        }, containerRef)

        return () => ctx.revert()
    }, [])

    // Card transition animation when question changes
    useEffect(() => {
        if (cardRef.current && currentQuestion > 0) {
            gsap.fromTo(cardRef.current,
                { y: 40, opacity: 0, scale: 0.97 },
                { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' }
            )
        }
        if (inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 500)
        }
    }, [currentQuestion])

    const handleSubmit = useCallback((e) => {
        e?.preventDefault()
        const trimmed = answer.trim().toLowerCase()
        const q = questions[currentQuestion]

        if (q.answers.includes(trimmed)) {
            setError(false)
            setShowResponse(true)

            // Success animation
            gsap.to(cardRef.current, {
                scale: 1.02,
                duration: 0.3,
                ease: 'power2.out',
                yoyo: true,
                repeat: 1,
            })

            // Mini confetti or Snow effect
            if (currentQuestion === 0) {
                // Snow White Effect for the first question
                const duration = 2000
                const end = Date.now() + duration
                const snowFrame = () => {
                    confetti({
                        particleCount: 4,
                        startVelocity: 0,
                        ticks: 200,
                        origin: {
                            x: Math.random(),
                            y: Math.random() - 0.2
                        },
                        colors: ['#ffffff', '#eaf0f8'],
                        shapes: ['circle'],
                        gravity: 0.4,
                        scalar: Math.random() * 0.6 + 0.4,
                        drift: Math.random() * 0.8 - 0.4,
                        zIndex: 10000,
                    })

                    if (Date.now() < end) {
                        requestAnimationFrame(snowFrame)
                    }
                }
                snowFrame()
            } else {
                // Regular confetti for other questions
                confetti({
                    particleCount: 40,
                    spread: 60,
                    origin: { y: 0.7 },
                    colors: ['#8b5cf6', '#f472b6', '#f59e0b'],
                    zIndex: 10000,
                })
            }

            setTimeout(() => {
                setShowResponse(false)
                setAnswer('')

                if (currentQuestion < questions.length - 1) {
                    // Fade out current card
                    gsap.to(cardRef.current, {
                        opacity: 0,
                        y: -30,
                        duration: 0.4,
                        ease: 'power2.in',
                        onComplete: () => {
                            setCurrentQuestion(prev => prev + 1)
                        }
                    })
                } else {
                    // All questions done!
                    setCompleted(true)
                    gsap.to(cardRef.current, {
                        opacity: 0,
                        scale: 0.9,
                        duration: 0.5,
                        ease: 'power2.in',
                    })
                }
            }, 2000)

        } else {
            setError(true)
            gsap.to(cardRef.current, {
                x: [-8, 8, -6, 6, -3, 3, 0],
                duration: 0.5,
                ease: 'power2.out',
            })
            setTimeout(() => setError(false), 2000)
        }
    }, [answer, currentQuestion])

    const handleFinalClick = () => {
        // Big confetti
        const duration = 3000
        const end = Date.now() + duration
        const interval = setInterval(() => {
            if (Date.now() > end) return clearInterval(interval)
            confetti({
                particleCount: 30,
                spread: 100,
                origin: { x: Math.random(), y: Math.random() * 0.6 },
                zIndex: 10000,
            })
        }, 200)

        gsap.to(containerRef.current, {
            opacity: 0,
            scale: 0.95,
            duration: 0.8,
            ease: 'power2.in',
            onComplete: onComplete,
        })
    }

    const q = questions[currentQuestion]
    const progress = ((currentQuestion + (showResponse ? 1 : 0)) / questions.length) * 100

    return (
        <div className="escape-room" ref={containerRef}>
            {/* Ambient particles */}
            <div className="particles" ref={particlesRef}>
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${Math.random() * 4 + 2}px`,
                            height: `${Math.random() * 4 + 2}px`,
                            animationDelay: `${Math.random() * 5}s`,
                        }}
                    />
                ))}
            </div>

            {/* Gradient orbs */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            {/* Header */}
            <div className="escape-header" ref={headerRef}>
                <p className="escape-header-line escape-tag">A journey through our memories</p>
                <h1 className="escape-header-line escape-title">
                    Before You Open Your Gift...
                </h1>
                <p className="escape-header-line escape-subtitle">
                    Answer these questions only a true friend would know
                </p>
            </div>

            {/* Progress */}
            <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
                <div className="progress-dots">
                    {questions.map((_, i) => (
                        <div
                            key={i}
                            className={`progress-dot ${i < currentQuestion ? 'done' : ''} ${i === currentQuestion ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            {/* Question Card */}
            {!completed && (
                <div className="question-card" ref={cardRef}>
                    <div className="card-badge">
                        <span>{q.emoji}</span>
                        <span>{q.badge}</span>
                    </div>

                    <h2 className="card-title">{q.title}</h2>
                    <p className="card-subtitle">{q.subtitle}</p>

                    <p className="card-question">{q.question}</p>

                    {!showResponse ? (
                        <form onSubmit={handleSubmit} className="card-form">
                            <div className={`input-wrapper ${error ? 'error' : ''}`}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Your answer..."
                                    autoComplete="off"
                                    autoFocus
                                />
                            </div>
                            <p className="card-hint">{q.hint}</p>
                            <button type="submit" className="submit-btn">
                                <span>Unlock Memory</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                            {error && (
                                <p className="error-text">That's not quite right... try again 💭</p>
                            )}
                        </form>
                    ) : (
                        <div className="success-response">
                            <div className="success-checkmark">✓</div>
                            <p>{q.emotionalResponse}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Completion Card */}
            {completed && (
                <div className="completion-card">
                    <div className="completion-emoji">🎉</div>
                    <h2>You Know Me So Well</h2>
                    <p>Every answer proved that our friendship is something truly special. Thank you for remembering all our little moments.</p>
                    <button className="reveal-btn" onClick={handleFinalClick}>
                        <span className="reveal-btn-text">Open Your Birthday Surprise</span>
                        <span className="reveal-btn-icon">🎁</span>
                    </button>
                </div>
            )}
        </div>
    )
}
