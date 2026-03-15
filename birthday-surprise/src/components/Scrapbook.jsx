import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import confetti from 'canvas-confetti'
import './Scrapbook.css'

/*
 * Each entry in `sides` is one visible page-side.
 * We pair them into physical sheets: sheet N shows sides[2N] (front-left)
 * and sides[2N+1] (front-right) when that sheet is the current spread.
 *
 * Physical sheets (flipping units):
 *   Sheet 0 = Cover
 *   Sheet 1..K = content sheets
 *   Sheet K+1 = Back cover
 */

const sides = [
    // Page 1 — dedication
    {
        type: 'dedication',
        text: '"Some people arrive and make such a beautiful impact on your life, you can barely remember what life was like without them."',
        author: '— Anna Taylor',
    },
    // Page 2 — Photo: Baby
    {
        type: 'photo',
        image: '/photos/b7da908c-0813-4e7a-9cb7-b071a32784d1.JPG',
        title: 'The Cutest Chapter 👶',
        caption: 'Before you were my friend, you were already amazing. Look at this little star! ✨',
    },
    // Page 3
    {
        type: 'photo',
        image: '/photos/IMG_3949.JPG',
        title: 'Road Trip Vibes 🚗',
        caption: "Shotgun = best seat in the house. Adventure is out there... and we're on our way!",
    },
    // Page 3.1
    {
        type: 'photo',
        image: '/photos/IMG_1623.PNG',
        title: 'Making Memories 📸',
        caption: 'Every picture tells a story.',
    },
    // Page 3.2
    {
        type: 'photo',
        image: '/photos/IMG_1624.PNG',
        title: 'Unforgettable 🌟',
        caption: 'Some moments are just meant to be captured forever.',
    },
    // Page 4
    {
        type: 'photo',
        image: '/photos/IMG_0719.jpg',
        title: 'Dumb Fuck 🧡',
        caption: 'Good food, warm lights, even warmer hearts. These are the moments I live for.',
    },
    // Page 5
    {
        type: 'photo',
        image: '/photos/IMG_0725.jpg',
        title: 'Mall Therapy 🛍️',
        caption: 'Shopping buddies for life! Just two people pretending to window shop.',
    },
    // Page 6
    {
        type: 'photo',
        image: '/photos/IMG_1394.jpg',
        title: 'Sweet Walks 🍦',
        caption: 'Street walks & sweet talks. Life is short, eat the ice cream first!',
    },
    // Page 7
    {
        type: 'photo',
        image: '/photos/IMG_1542.jpg',
        title: 'Unboxing Happiness 📦',
        caption: 'That "my order arrived" face > everything. Happiness delivered! 🎁',
    },
    // Page 8
    {
        type: 'photo',
        image: '/photos/41A9D2AC-A823-4B15-9C33-76BCD2B2F402.JPG',
        title: 'Café Vibes ☕',
        caption: 'Our kind of therapy: good food & better conversation. Every meal with you is a memory.',
    },
    // Page 9
    {
        type: 'photo',
        image: '/photos/IMG_1783%202.jpg',
        title: 'Blurry Memories 💫',
        caption: 'Blurry pics, clear memories. Too busy laughing to take a clear photo!',
        position: 'center 40%', // Pulls photo up
    },
    // Page 10
    {
        type: 'photo',
        image: '/photos/IMG_1785.jpg',
        title: 'Something',
        caption: "We laugh so hard, even the camera can't keep up. Tilted camera, straight-up best friends!",
        position: 'center 40%', // Pulls photo up
    },
    // Page 11
    {
        type: 'photo',
        image: '/photos/0266554D-9089-499E-BE92-6B4CD6C13BBE.JPG',
        title: 'Night Owls 🌙',
        caption: 'Late nights, best lights. Every sunset brings the promise of a new dawn... but we prefer the night ✨',
        position: 'center 40%', // Pulls photo up
    },
    // Page 12 — final message
    {
        type: 'final',
        title: 'Happy Birthday! 🎂',
        text: "Here's to another year of adventures, late-night talks, ugly laughing, and making memories we'll look back on like these.",
        sign: 'With love,',
        signName: 'Rahul',
    },
]

// Build physical sheets: each sheet has a front side and a back side
// Sheet 0 = cover (front = cover art, back = sides[0])
// Sheet 1 = sides[1] front, sides[2] back
// ...etc, pairing sides in sequential order
function buildSheets() {
    const sheets = []

    // Cover sheet: front = cover art, back = first content side
    sheets.push({
        front: { type: 'cover' },
        back: sides[0],
    })

    // Content sheets: pair remaining sides sequentially
    for (let i = 1; i < sides.length; i += 2) {
        sheets.push({
            front: sides[i],
            back: i + 1 < sides.length ? sides[i + 1] : { type: 'backCover' },
        })
    }

    return sheets
}

const sheets = buildSheets()

const allPages = [
    { type: 'cover' },
    ...sides,
    { type: 'backCover' }
]

export default function Scrapbook() {
    const [currentPage, setCurrentPage] = useState(0)
    const [mobilePage, setMobilePage] = useState(0)
    const [flippedPages, setFlippedPages] = useState(new Set())
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const containerRef = useRef(null)
    const bookRef = useRef(null)
    const audioRef = useRef(null)
    const totalSheets = sheets.length

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        // Attempt to auto-play background music
        if (audioRef.current) {
            audioRef.current.volume = 0.4 // gentle background volume
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => {
                    console.log("Autoplay prevented by browser:", err)
                    setIsPlaying(false)
                })
        }
        const ctx = gsap.context(() => {
            gsap.from('.scrapbook-title', {
                y: -30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
            })
            gsap.from('.book-container', {
                scale: 0.9,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
                delay: 0.2,
            })
            gsap.from('.nav-controls', {
                y: 20,
                opacity: 0,
                duration: 0.6,
                delay: 0.5,
            })
        }, containerRef)

        confetti({
            particleCount: 60,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#8b6f47', '#c9a87c', '#dab897', '#f472b6'],
            zIndex: 10000,
        })

        return () => ctx.revert()
    }, [])

    const nextPage = () => {
        if (currentPage >= totalSheets) return
        setFlippedPages(prev => {
            const next = new Set(prev)
            next.add(currentPage)
            return next
        })
        setCurrentPage(prev => prev + 1)
    }

    const prevPage = () => {
        if (currentPage <= 0) return
        const newCurrent = currentPage - 1
        setFlippedPages(prev => {
            const next = new Set(prev)
            next.delete(newCurrent)
            return next
        })
        setCurrentPage(newCurrent)
    }

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play().catch(console.error)
            }
            setIsPlaying(!isPlaying)
        }
    }

    const nextMobilePage = () => {
        if (mobilePage >= allPages.length - 1) return
        setMobilePage(prev => prev + 1)
    }

    const prevMobilePage = () => {
        if (mobilePage <= 0) return
        setMobilePage(prev => prev - 1)
    }

    const getMobilePageLabel = () => {
        if (mobilePage === 0) return 'Cover'
        if (mobilePage === allPages.length - 1) return 'Back Cover'
        return `Page ${mobilePage}`
    }

    const getPageLabel = () => {
        if (currentPage === 0) return 'Cover'
        if (currentPage === totalSheets) return 'Back Cover'
        // Each content sheet shows 2 page numbers
        const leftPage = currentPage * 2 - 1
        const rightPage = currentPage * 2
        return `Page ${leftPage}–${rightPage}`
    }

    const getBookTransform = () => {
        if (currentPage === 0) return 'translateX(0%)'
        if (currentPage === totalSheets) return 'translateX(100%)'
        return 'translateX(50%)'
    }

    const renderSide = (content) => {
        if (!content) return <div className="page-inner" />

        if (content.type === 'cover') {
            return (
                <div className="cover-content">
                    <p className="cover-tag">A collection of you</p>
                    <h2 className="cover-heading">Happy Birthday Stupid</h2>
                    <div className="cover-line" />
                    <p className="cover-year">2007 – </p>
                    <p className="cover-hint">Click to open →</p>
                </div>
            )
        }

        if (content.type === 'backCover') {
            return (
                <div className="cover-content">
                    <p className="cover-tag">Thank you for everything</p>
                    <h2 className="cover-heading">The End</h2>
                    <div className="cover-line" />
                    <p className="cover-year">Made with ❤️</p>
                </div>
            )
        }

        if (content.type === 'dedication') {
            return (
                <div className="page-inner dedication-page">
                    <div className="floral-corner top-left"></div>
                    <div className="floral-corner bottom-right"></div>
                    <p className="dedication-text">{content.text}</p>
                    <p className="dedication-author">{content.author}</p>
                </div>
            )
        }

        if (content.type === 'photo') {
            return (
                <div className="page-inner photo-page-content">
                    <div className="floral-corner top-left"></div>
                    <div className="floral-corner bottom-right"></div>
                    <div
                        className="photo-frame"
                        style={{
                            backgroundImage: `url(${content.image})`,
                            backgroundPosition: content.position || 'top center'
                        }}
                    />
                    <h3 className="photo-title">{content.title}</h3>
                    <p className="photo-caption">{content.caption}</p>
                </div>
            )
        }

        if (content.type === 'final') {
            return (
                <div className="page-inner final-page-content">
                    <div className="floral-corner top-left"></div>
                    <div className="floral-corner bottom-right"></div>
                    <h2 className="final-title">{content.title}</h2>
                    <div className="final-divider" />
                    <p className="final-text">{content.text}</p>
                    <p className="final-sign">{content.sign}<br /><span>{content.signName}</span></p>
                </div>
            )
        }

        return null
    }

    return (
        <div className="scrapbook" ref={containerRef}>
            <audio
                ref={audioRef}
                src="/See You Again (feat. Charlie Puth)_spotdown.org.mp3"
                loop
            />

            <button
                className={`audio-toggle ${isPlaying ? 'playing' : ''}`}
                onClick={toggleAudio}
                aria-label={isPlaying ? "Mute music" : "Play music"}
            >
                {isPlaying ? '🔊' : '🔇'}
            </button>

            <div className="scrapbook-bg">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>

            <h1 className="scrapbook-title">Idiotic Book</h1>

            {isMobile ? (
                <div className="mobile-book-container">
                    <div className="mobile-page-wrapper" key={mobilePage}>
                        <div className={`page-front ${allPages[mobilePage].type === 'cover' ? 'cover-front' : ''} ${allPages[mobilePage].type === 'backCover' ? 'cover-back' : ''}`}>
                            {renderSide(allPages[mobilePage])}
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className="book-container"
                    style={{ transform: getBookTransform() }}
                >
                    <div className="book" ref={bookRef}>
                        {sheets.map((sheet, i) => {
                            const isFlipped = flippedPages.has(i)
                            const zIndex = isFlipped ? i + 1 : totalSheets - i

                            const isCoverFront = sheet.front?.type === 'cover'
                            const isCoverBack = sheet.back?.type === 'cover' || sheet.back?.type === 'backCover'

                            return (
                                <div
                                    key={`sheet-${i}`}
                                    className={`page ${isFlipped ? 'flipped' : ''}`}
                                    style={{ zIndex }}
                                    onClick={() => currentPage === i && nextPage()}
                                >
                                    <div className={`page-front ${isCoverFront ? 'cover-front' : ''}`}>
                                        {renderSide(sheet.front)}
                                    </div>
                                    <div className={`page-back ${isCoverBack ? 'cover-back' : ''}`}>
                                        {renderSide(sheet.back)}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="nav-controls">
                <button
                    onClick={isMobile ? prevMobilePage : prevPage}
                    disabled={isMobile ? mobilePage === 0 : currentPage === 0}
                    className="nav-btn"
                >
                    ← Prev
                </button>
                <span className="page-label">
                    {isMobile ? getMobilePageLabel() : getPageLabel()}
                </span>
                <button
                    onClick={isMobile ? nextMobilePage : nextPage}
                    disabled={isMobile ? mobilePage >= allPages.length - 1 : currentPage >= totalSheets}
                    className="nav-btn"
                >
                    Next →
                </button>
            </div>
        </div>
    )
}
