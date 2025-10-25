
export function handleMapInteractions({ map }) {
    const disableMapInteractions = () => {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        map.touchZoom.disable();
    };

    const enableMapInteractions = () => {
        map.dragging.enable();
        map.scrollWheelZoom.enable();
        map.doubleClickZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
        map.touchZoom.enable();
    };

    return { enableMapInteractions, disableMapInteractions };
}
