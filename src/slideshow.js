import React, { useState, useEffect } from 'react';
import './slideshow.css';

const slides = [
    {
        id: 1,
        content: (
            <div>
                <h2>Who invented the PASSION FRAMEWORK?</h2>
                <p>Dr Prakash Sharma is the first of its kind framework which addresses both process and well-being requirements, the framework can be used by any organization or unit to improve quality processes and aligns well with all global standard certifications.  PCOMBINATOR founded by Dr Prakash Sharma has been benchmarked by UBI Global 2022-2023 as Top Asia Pacific Challengers in the startup ecosystem. Recently also got assessed by Villgro with support from Harvard Business School and Chicago Business School. Have got excellent scores in customer and supplier satisfaction.</p>
            </div>
        )
    },
    {
        id: 2,
        content: (
            <div>
                <h2>Explore our specialized domain PCombinator</h2>
                <p>A platform to bring academicians, researchers, mentors, organizations, investors, students, freshers, and resources needing direction to work together in a collaborative way to improve their revenue opportunities through effective project management of their concepts to convert the same to a product for sales.</p>
            </div>
        )
    },
];


const Slideshow = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 100000); // 2 minutes

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="slideshow-container">
            <div className="slide">
                {slides[current].content}
            </div>
        </div>
    );
};

export default Slideshow;
