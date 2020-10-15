import MapDebug from 'src/lib/debugger';

declare global {
    interface Window {
        $debugger: MapDebug;
    }
}
