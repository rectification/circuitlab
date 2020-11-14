import { Point } from 'src/lib/point';

export function getBackgroundStyle(zoom: number, position: Point): React.CSSProperties {
    const size = zoom * 20;
    const biasX = position[0] % size;
    const biasY = position[1] % size;

    return {
        backgroundSize: `${size}px`,
        backgroundPosition: `${biasX}px ${biasY}px`,
    };
}
