import Head from 'next/head'
import shuffle from 'lodash/shuffle'
import { useInterval } from '../services'
import { useCallback, useState, useEffect } from 'react'
import { Dropzone, GalleryOptions, Gallery } from '../components'
import css from './index.module.css'

export default function Home() {
    const [files, setFiles] = useState([])
    const [shuffledFiles, setShuffledFiles] = useState([])
    const [activeIndex, setActiveIndex] = useState(0) // index in all the images
    const [showGallery, setShowGallery] = useState(false)
    const [paused, setPaused] = useState(false)
    const [option, setOption] = useState()
    const [classProgression, setClassProgression] = useState(0) // index in the class array
    const [interval, setInterval] = useState(1)
    const [countdown, setCountdown] = useState(interval)
    const classMode = [Array(10).fill(30), Array(5).fill(60), [300]].flat()
    // const classMode = [3, 3, 3]

    const handleOptionChange = (option, value) => {
        setOption(option)

        if (option === 'interval') {
            setInterval(value)
        } else if (option === 'class') {
            setInterval(classMode[0])
        }
    }
    const startGallery = () => {
        if (!files.length) return
        console.log('start gallery')

        // move focus from start button to div so we can detect keydown
        document.getElementById('container').focus()

        if (option === 'inteval') {
            setCountdown(interval)
        } else if (option === 'class') {
            setClassProgression(0)
            setInterval(classMode[0])
            setCountdown(classMode[0])
        }
        setShuffledFiles(shuffle(files))
        setActiveIndex(0)
        setPaused(false)
        setShowGallery(true)
    }
    const stopGallery = () => {
        setPaused(true)
        setShowGallery(false)
    }
    const moveBy = useCallback(
        (delta) => {
            const newIndex = activeIndex + delta
            if (newIndex < 0) {
                return // stop at the first ref
            } else if (newIndex >= files.length) {
                stopGallery()
            } else {
                setActiveIndex(newIndex)
            }
            setCountdown(interval)
        },
        [files, activeIndex, interval, classProgression, classMode, option],
    )
    const handleKeyDown = (e) => {
        if (e.code === 'Space') setPaused((p) => !p)
        if (e.code === 'ArrowRight') moveBy(1)
        if (e.code === 'ArrowLeft') moveBy(-1)
        if (e.code === 'KeyQ' || e.code == 'Escape') stopGallery()
    }

    useInterval(function tick() {
        if (paused || !showGallery || !files.length) return
        setCountdown(countdown - 1)
    }, 1000)

    useEffect(() => {
        if (countdown <= 0) {
            moveBy(1)

            if (option === 'class') {
                const newClassProgression = classProgression + 1

                setInterval(classMode[newClassProgression])
                setClassProgression(newClassProgression)

                if (newClassProgression >= classMode.length) {
                    stopGallery()
                }
            }
        }
    }, [countdown, classProgression])

    return (
        <div id="container" tabIndex={0} onKeyDown={handleKeyDown} className={css.container}>
            <Head>
                <title>Quick Poses Gallery</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={css.main}>
                <h1 className={css.title}>Quick Poses Gallery</h1>

                <Dropzone files={files} setFiles={setFiles} />

                <GalleryOptions
                    startGallery={startGallery}
                    handleOptionChange={handleOptionChange}
                />

                <Gallery
                    files={shuffledFiles}
                    interval={interval}
                    paused={paused}
                    setPaused={setPaused}
                    showGallery={showGallery}
                    activeIndex={activeIndex}
                    option={option}
                    classMode={classMode}
                    classProgression={classProgression}
                    countdown={countdown}
                    stopGallery={stopGallery}
                    moveBy={moveBy}
                />
            </main>

            {/* <div className={css.debug}>
                <span>showGallery: {showGallery.toString()}</span>
                <span>paused: {paused.toString()}</span>
                <span>option: {option}</span>
                <span>
                    activeIndex/filesLength: {activeIndex}/{files.length}
                </span>
                <span>
                    classProgression/classLength: {classProgression}/{classMode.length}
                </span>
                <span>interval: {interval}</span>
                <span>countdown: {countdown}</span>
            </div> */}
        </div>
    )
}
