import { createContext, useEffect, useState } from "react";
import { useRouter } from 'next/router'

export const PageTransitionContext = createContext(2);
export const PageTransitionContextProvider = ({ children }) => {
    const router = useRouter();
    const [lastDuration, setLastDuration] = useState(400);
    const navigateAway = (router_url, duration = 300) => {
        let fadeOutBody = [...document.getElementsByClassName('main-body')];
        fadeOutBody.forEach((body) => {
            body.classList.remove('fadeInNormal');
            body.classList.add('fadeOut');
            body.style.animationDuration = `${duration}ms`
        })
        setTimeout(() => {
            router.push(router_url)
        })
    }
    useEffect(() => {
    }, [])
    return (
        <PageTransitionContext.Provider value={{
            navigateAway
        }}>
            {children}
        </PageTransitionContext.Provider>
    )
}