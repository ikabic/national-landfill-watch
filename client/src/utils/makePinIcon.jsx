import L from "leaflet";

export const makePinIcon = (color, innerIcon) =>
    new L.DivIcon({
        html: `
        <div class="pin-body" style="--pin-color:${color}">
            <div class="pin-inner">${innerIcon}</div>
        </div>
        `,
        className: "pin",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });
    