import React, { useState } from "react";
import Sheen from "../typography/Sheen";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGithub,
    faInstagramSquare,
    faYoutube,
    faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";
import { useSpring } from "react-spring";
import { animated } from "react-spring";
import usePurpleHover from "../hooks/usePurpleHover";

const IntroComponent = () => {
    // For now, I'll have my paragraphs be stored in variables. In the future this can be handled
    // via admin interface
    const [setIsHover, hoverAnimate] = usePurpleHover();
    const [flipped, setFlipped] = useState(false);
    const { transform, opacity } = useSpring({
        opacity: flipped ? 1 : 0,
        transform: `perspective(26rem) rotateX(${flipped ? 180 : 0}deg)`,
        config: { mass: 5, tension: 500, friction: 80 },
    });

    const firstParagraph = `I'm Angel, a <Sheen>4th year CISE Major</Sheen> at UF graduating <Sheen>May 2024!</Sheen> I'm a passionate, results-driven software and web developer. My past work experience mainly consists of <Sheen>Web Dev</Sheen>, <Sheen>Systems Engineering</Sheen>, and <Sheen>UI  Design.</Sheen>`;
    const secondParagraph = `I love browsing <Sheen>GitHub</Sheen> in search of new <Sheen>open-source technologies</Sheen> to try out and learn. I also love learning in general, and sharing what I learn with others who are also hungry for knowledge.`;
    const thirdParagraph = `I like to post about pretty much anything on my <Sheen>Blog</Sheen> every-so-often. In my free time I like to watch <Sheen>YouTube</Sheen>, play <Sheen>Video Games</Sheen>, and play <Sheen> Racquetball</Sheen>.`;

    const totalWords =
        firstParagraph.split(" ").length +
        secondParagraph.split(" ").length +
        thirdParagraph.split(" ").length;
    const sequenceAnimation = (str, prevElements = 0) => {
        return str.split(" ").map((word, index) => {
            if (word.includes("<Sheen>") || inSheen) {
                inSheen = true;
                if (word.includes("</Sheen>")) inSheen = false;
                return (
                    <Sheen
                        key={`word-${prevElements + index}`}
                        style={{
                            animationDelay: `${
                                1000 + (index + prevElements) * 50
                            }ms`,
                        }}
                        className="popIn"
                    >
                        {word.replace("<Sheen>", "").replace("</Sheen>", "")}
                        &nbsp;
                    </Sheen>
                );
            }
            return (
                <span
                    key={`word-${prevElements + index}`}
                    style={{
                        animationDelay: `${
                            1000 + (index + prevElements) * 50
                        }ms`,
                    }}
                    className="popIn"
                >
                    {word}&nbsp;
                </span>
            );
        });
    };
    let inSheen = false;

    return (
        <animated.div onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)} style={hoverAnimate} className="w-full h-full relative rounded-md flex items-center z-50 justify-center">
            <animated.div
                style={{
                    zIndex: 5,
                    opacity,
                    transform,
                    rotateX: "180deg",
                }}
                onClick={() => setFlipped((state) => !state)}
                className="card-container back h-96 w-96 rounded-md cursor-pointer"
            >
                <div className="pt-3 pl-3 pb-3 w-full bg-black">
                    <Sheen>This is my dog Bella btw</Sheen>
                </div>
            </animated.div>
            <animated.div
                style={{
                    zIndex: flipped ? 0 : 10,
                    opacity: opacity.to((o) => 1 - o),
                    transform,
                }}
                className="w-full card-container h-full bg-blue-gradient rounded-md flex flex-col gap-y-2"
            >
                <div
                    onClick={() => setFlipped((state) => !state)}
                    className="w-full h-8 flex justify-end pt-3 pr-3"
                >
                    <FontAwesomeIcon icon={faRepeat} />
                </div>
                <h1 className="text-2xl px-8 font-bold tracking-normal">
                    Buenas!
                </h1>
                <div className="text-xs px-8 text-[#A19D9D]">
                    <p className="flex flex-wrap">
                        {sequenceAnimation(firstParagraph, 0)}
                    </p>
                    <br></br>
                    <p className="flex flex-wrap">
                        {sequenceAnimation(
                            secondParagraph,
                            firstParagraph.split(" ").length
                        )}
                    </p>
                    <br></br>
                    <p className="flex flex-wrap">
                        {sequenceAnimation(
                            thirdParagraph,
                            secondParagraph.split(" ").length +
                                firstParagraph.split(" ").length
                        )}
                    </p>
                </div>
                <div className="w-full pl-8 pt-2 flex gap-x-2">
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://github.com/angel1254mc/"
                        className="w-7 h-7 hover:text-blue-300 text-2xl flex justify-center transition-all duration-100 cursor-pointer hover:text-3xl"
                    >
                        <FontAwesomeIcon
                            style={{
                                animationDelay: `${1050 + totalWords * 50}ms`,
                            }}
                            height={"1.75rem"}
                            width={"1.75rem"}
                            className="popIn"
                            icon={faGithub}
                        />
                    </a>
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://www.linkedin.com/in/angel1254/"
                        className="w-7 h-7 hover:text-blue-300 text-2xl flex justify-center transition-all duration-100 cursor-pointer hover:text-3xl"
                    >
                        <FontAwesomeIcon
                            style={{
                                animationDelay: `${1100 + totalWords * 50}ms`,
                            }}
                            className="popIn"
                            icon={faLinkedin}
                        />
                    </a>
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://www.instagram.com/angel1254/"
                        className="w-7 h-7 hover:text-blue-300 text-2xl flex justify-center transition-all duration-100 cursor-pointer hover:text-3xl"
                    >
                        <FontAwesomeIcon
                            style={{
                                animationDelay: `${1150 + totalWords * 50}ms`,
                            }}
                            className="popIn"
                            icon={faInstagramSquare}
                        />
                    </a>
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://www.youtube.com/channel/UC-kEszCPZTbWdRjt9RhVsYA"
                        className="w-7 h-7 hover:text-blue-300 text-2xl flex justify-center transition-all duration-100 cursor-pointer hover:text-3xl"
                    >
                        <FontAwesomeIcon
                            style={{
                                animationDelay: `${1100 + totalWords * 50}ms`,
                            }}
                            className="popIn"
                            icon={faYoutube}
                        />
                    </a>
                </div>
            </animated.div>
        </animated.div>
    );
};

export default IntroComponent;
