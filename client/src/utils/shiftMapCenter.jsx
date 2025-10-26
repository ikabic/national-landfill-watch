
export function shiftMapCenter(map, panelOpen, layersOpen, center, zoom) {
    if (!map) return;

    map.invalidateSize();
    if (center) map._baseCenter = center;
    else if (!map._baseCenter) map._baseCenter = map.getCenter();

    const baseCenter = center ?? map._baseCenter;
    const offsetX = (panelOpen ? 300 : 0) + (layersOpen ? -200 : 0);
    const baseZoom = zoom ?? map.getZoom();

    const targetPoint = map.project(baseCenter, baseZoom).add([offsetX, 0]);
    const targetLatLng = map.unproject(targetPoint, baseZoom);

    map.flyTo(targetLatLng, baseZoom, { animate: true, duration: 0.5 });

    if (!panelOpen && !layersOpen) map._baseCenter = undefined;
}
