import Image from "next/image";
import React from "react";
import FaroImage from "../../public/faro.webp";
import { faro } from "@grafana/faro-web-sdk";
import { useEffect } from "react";
import { useContext } from "react";
import FaroContext from "../../init/FaroContext";
import { useState } from "react";
import { onFID, onTTFB, onFCP, onINP, onCLS} from 'web-vitals';

const FaroComponent = () => {
    const { faroState } = useContext(FaroContext);
    const [webVitals, setWebVitals] = useState({});
    const [overallRating, setOverallRating] = useState("Loading...");

    useEffect(() => {
        onFID((metric) => {
            setWebVitals(state => {
                return {...state, fid: metric}
            })
        })
        onCLS((metric) => {
            setWebVitals(state => {
                return {...state, cls: metric}
            })
        })
        onTTFB((metric) => {
            setWebVitals(state => {
                return {...state, ttfb: metric}
            })
        })
        onFCP((metric) => {
            setWebVitals(state => {
                return {...state, fcp: metric}
            })
        })
    }, []);

    useEffect(() => {
        if (webVitals.fid && webVitals.cls && webVitals.ttfb && webVitals.fcp) {
            let goodCounter = 0;
            let ratingArr = Object.keys(webVitals).map((metric) => webVitals[metric].rating);
            for (let i = 0; i < ratingArr.length; i++) {
                if (ratingArr[i] == "good") {
                    goodCounter++;
                }
            }
            if (goodCounter < 1) {
                setOverallRating("Bruh 💀")
            } else if (goodCounter < 3) {
                setOverallRating("Needs Improvement")
            } else if (goodCounter == 4) {
                setOverallRating("Lookin' Good!")
            }
        }
    }, [webVitals])
    return (
        <div className="w-full flex flex-col hover:scale-105 transition-all duration-150 hover:shadow-[0px_0px_105px_3px_rgba(192,77,246,0.25)] bg-[#101010] border-[1px] border-[#101010] rounded-md">
            <div className="flex gap-x-2 w-full border-b-[1px] mb-1 px-4 py-3 border-b-[#1D1D1D]">
                <Image
                    className="w-6 h-8"
                    src={FaroImage}
                    loading="eager"
                    width={100}
                    height={100}
                />
                <div>
                    <h1 className="text-sm font-bold">Site Stats</h1>
                    <p className="text-xs font-light">
                        Powered by Grafana Faro and web-vitals pkg.
                    </p>
                </div>
            </div>
            {webVitals.err ? (
                <div>There was an error gathering web vitals 🥲</div>
            ) : (
                <div className="w-full h-full flex py-1 flex-wrap">
                    <div className="w-1/3 flex flex-col gap-y-1 items-center justify-center border-r-[1px] mb-2 border-r-[#1D1D1D] h-20">
                        <h3 className="text-sm font-bold">
                            TTFB
                        </h3>
                        <p className={`text-base font-bold pb-2 ${webVitals.ttfb ? (webVitals?.ttfb?.rating == "good" ? "text-green-500" : webVitals.ttfb.rating == "poor" ? "text-red-400" : "text-yellow-400") : "text-gray-400"}`}>
                            {webVitals?.ttfb?.value?.toPrecision(5) ?? "Loading..."}
                        </p>
                    </div>
                    <div className="w-1/3 flex flex-col gap-y-1 items-center justify-center border-r-[1px] mb-2 border-r-[#1D1D1D] h-20">
                        <h3 className="text-sm font-bold">
                            FCP
                        </h3>
                        <p className={`text-base font-bold pb-2 ${webVitals.fcp ? (webVitals?.fcp?.rating == "good" ? "text-green-500" : webVitals.fcp.rating == "poor" ? "text-red-400" : "text-yellow-400") : "text-gray-400"}`}>
                            {webVitals?.fcp?.value?.toPrecision(5) ?? "Loading..."}
                        </p>
                    </div>
                    <div className="w-1/3 flex flex-col gap-y-1 items-center justify-center h-20 mb-2">
                        <h3 className="text-sm font-bold">
                            FID
                        </h3>
                        <p className={`text-base font-bold pb-2 ${webVitals.fid ? (webVitals?.fid?.rating == "good" ? "text-green-500" : webVitals.fid.rating == "poor" ? "text-red-400" : "text-yellow-400") : "text-gray-400"}`}>
                            {webVitals?.fid?.value?.toPrecision(5) ?? "Loading..."}
                        </p>
                    </div>
                    <div className="w-1/3 flex flex-col gap-y-1 items-center justify-center mb-2 border-r-[1px] border-r-[#1D1D1D] h-20">
                        <h3 className="text-sm font-bold">
                            CLS
                        </h3>
                        <p className={`text-base font-bold pb-2 ${webVitals.cls ? (webVitals?.cls?.rating == "good" ? "text-green-500" : webVitals.cls.rating == "poor" ? "text-red-400" : "text-yellow-400") : "text-gray-400"}`}>
                            {webVitals?.cls?.value?.toPrecision(5) ?? "Loading..."}
                        </p>
                    </div>
                    <div className="w-2/3 flex flex-col gap-y-1 items-center justify-center h-20 mb-2">
                        <h3 className="text-sm font-bold">
                            Overall?
                        </h3>
                        <p className={`text-base font-bold pb-2 ${overallRating != "Loading..." ? (overallRating == "Lookin' Good!" ? "text-green-500" : "text-yellow-400") : "text-gray-400"}`}>
                            {overallRating}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FaroComponent;
