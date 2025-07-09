import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageVariants = {
    initial: {
        opacity: 0,
        x: -20,
        y: 10
    },
    in: {
        opacity: 1,
        x: 0,
        y: 0
    },
    out: {
        opacity: 0,
        x: 20,
        y: -10
    }
};

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
};

const AnimatedRoutes = ({ children }) => {
    const location = useLocation();
    
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="animated-page"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

export default AnimatedRoutes;