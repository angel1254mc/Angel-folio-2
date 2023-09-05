import React, { useEffect, useRef } from "react";
import styles from '../styles/components/Header.module.css';
import { animated } from "react-spring";

/**
 * @function random generates a random number between parameters min and max
 */
const random = (min, max) => {
    return Math.floor(Math.random() * max) + min;
}

/**
 * Header function creates a header element for the current page. Meant to be put at the top of the page
 * (usually). Takes in a title parameter that denotes the text that will be included in the title
 * @param {*} param0
 * @returns
 */
function Header({ title, size = null , animateStyle={}, interval = 3000 }) {
    if (title.length > 25)
        size = '3rem';
    const ref = useRef();
    useEffect(() => {
        if (size)
                ref.current.style.fontSize = size;
        const colorInterval = setInterval(() => {
            ref.current.style.color = `hsl(${random(1,360)}, ${random(60,100)}%, ${random(40,60)}%)`;
        }, interval)
        return () => clearInterval(colorInterval);

    }, [])

  return <animated.div ref={ref} style={animateStyle} className={styles.gradient}>{title}</animated.div>;
}

export default Header;
