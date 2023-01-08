import React, { useState } from "react";
import { useLikes } from "../lib/useLikes";
import { animated } from "@react-spring/web";
import { useSpring, config } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import Header from "./Header";

/**
 * @function random generates a random number between parameters min and max
 */
const random = (min, max) => {
  return Math.floor(Math.random() * max) + min;
};

const LikeButton = ({ slug }) => {
  const { currentUserLikes, likes, isLoading, isError, increment } =
    useLikes(slug);

  const { color, backgroundColor } = useSpring({
    config: config.gentle,
    backgroundColor:
      currentUserLikes == 3
        ? "#D34A53"
        : currentUserLikes == 2
        ? "#731C22"
        : currentUserLikes == 1
        ? "#421013"
        : "#101010",
    color:
      currentUserLikes == 3
        ? "#D34A53"
        : currentUserLikes == 2
        ? "#731C22"
        : currentUserLikes == 1
        ? "#421013"
        : "#101010",
  });
  const [{ x, y, scale }, api] = useSpring(() => ({
    config: config.gentle,
    scale: 1,
  }));
  const bind2 = useGesture({
    onHover: ({ hovering }) => api({ scale: hovering ? 1.2 : 1.0 }),
    onDrag: ({ down }) =>
      api({
        scale: down ? 1.02 : 1.2,
      }),
  });

  if (isLoading) {
    return <div>Loading Likes...</div>;
  } else {
    return (
      <div className="flex flex-row w-full gap-x-2 items-center justify-between py-2">
        <div className="flex flex-row gap-x-2">
            <div className="text-[1.3rem] text-gray-400">{likes}</div>
            <div className="text-[1.3rem] text-gray-400">Likes </div>
        </div>
        <div className="text-[1.2rem]"></div>
        <animated.div
          {...bind2()}
          onClick={() => {
            increment();
          }}
          style={{
            height: "40px",
            width: "40px",
            backgroundColor: backgroundColor,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: "10px",
            alignItems: "center",
            scale: scale,
            position: "relative",
          }}
        >
          <FontAwesomeIcon
            style={{
              height: "25px",
              width: "25px",
            }}
            icon={faHeart}
          />
          <animated.div
            style={{
              position: "absolute",
              marginLeft: "auto",
              top: "auto",
              fontWeight: "bold",
              fontSize: '0.7rem',
              color: color,
            }}
          >
            {currentUserLikes}
          </animated.div>
        </animated.div>
      </div>
    );
  }
};

export default LikeButton;
