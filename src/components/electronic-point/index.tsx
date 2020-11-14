import React from 'react';

import { useState, useRef, useEffect } from 'react';

interface Props {
    r?: number;
    mapZoom?: number;
    className?: string;
    status: {
        hover: number;
        normal: number;
    };
}

export function Point(props: Props) {
    const {
        r = 1,
        mapZoom = 1,
        className = '',
        status,
    } = props;

    const circle = useRef<SVGCircleElement>(null);
    const animate = useRef<SVGAnimationElement>(null);
    const [inner, setInner] = useState(0);
    const [actual, setActual] = useState(0);
    const [animateTo, setAnimateTo] = useState(0);
    const [animateFrom, setAnimateFrom] = useState(0);

    function setAnimate() {
        if (!circle.current || !animate.current) {
            return;
        }

        const rect = circle.current.getBoundingClientRect();
    
        // 计算当前值
        setAnimateFrom(rect ? rect.width / mapZoom / 2 : 0);
        // 确定新的终点值
        setAnimateTo(actual);
        // 动画启动
        animate.current.beginElement();
    }
    
    function onMouseEnter() {

    }

    function onMouseLeave() {

    }

    useEffect(() => {
        setActual(r >= 0 ? r : inner);
    }, [r, inner]);

    useEffect(() => setAnimate(), [actual]);

    return (
        <g className={className}>
            <circle ref={circle} cx='0' cy='0'>
                <animate
                    ref={animate}
                    fill='freeze'
                    attributeType='XML'
                    attributeName='r'
                    begin='indefinite'
                    calcMode='spline'
                    keyTimes='0; 1'
                    keySplines='.2 1 1 1'
                    dur='200ms'
                    values={`${animateFrom}; ${animateTo}`}>
                </animate>
            </circle>
            <rect
                x='-8.5'
                y='-8.5'
                height='17'
                width='17'
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            />
        </g>
    );
}
