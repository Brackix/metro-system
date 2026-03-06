import { OmsaStop } from './omsaStopsService';

export function generateOmsaStopsMarkers(stops: OmsaStop[], selectedOmsaStopId?: number): string {
  return stops
    .filter(stop => stop.lat !== null && stop.lng !== null)
    .map(stop => {
      const corridor = stop.corridor || '';
      const corridorNumber = corridor.match(/\d+/)?.[0] || '0';
      const baseColor = getCorridorColor(corridorNumber);
      
      return `
        var icon_${stop.stopid} = L.divIcon({
          className: 'omsa-stop-marker',
          html: '<div style="position: relative; width: 28px; height: 38px;">' +
                '<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3))">' +
                '<path d="M14 0C8.477 0 4 4.477 4 10c0 8.5 10 25 10 25s10-16.5 10-25c0-5.523-4.477-10-10-10z" ' +
                'fill="${baseColor}" stroke="white" stroke-width="1.5"/>' +
                '<circle cx="14" cy="10" r="4.5" fill="white" stroke="${baseColor}" stroke-width="1"/>' +
                '</svg>' +
                '<div style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); background: white; padding: 2px 6px; border-radius: 3px; font-size: 9px; white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">' +
                '${stop.code}' +
                '</div></div>',
          iconSize: [28, 38],
          iconAnchor: [14, 38],
          popupAnchor: [0, -38],
          className: 'omsa-marker'
        });
        
        var marker_${stop.stopid} = L.marker([${stop.lat}, ${stop.lng}], { icon: icon_${stop.stopid} })
          .bindPopup(
            '<div style="font-weight: bold; font-size: 13px; color: #111827; margin-bottom: 4px;">${stop.name}</div>' +
            '<div style="color: #6B7280; font-size: 11px; margin-bottom: 2px;"><strong>📍 Corredor:</strong> ${corridor || 'N/A'}</div>' +
            '<div style="color: #6B7280; font-size: 11px; margin-bottom: 4px;"><strong>📌 Código:</strong> ${stop.code}</div>' +
            '<div style="color: #9CA3AF; font-size: 10px; font-style: italic;">${stop.address || 'Sin dirección'}</div>'
          )
          .on('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'omsaStopClick',
              stopId: ${stop.stopid},
              name: '${stop.name}',
              corridor: '${corridor}',
              lat: ${stop.lat},
              lng: ${stop.lng}
            }));
          });
        
        marker_${stop.stopid}.stopId = ${stop.stopid};
        omsaStopsLayer.addLayer(marker_${stop.stopid});
      `;
    })
    .join('\n');
}

function getCorridorColor(corridorNumber: string): string {
  const colors: { [key: string]: string } = {
    '1': '#F87171',
    '2': '#FB923C',
    '3': '#FBBF24',
    '4': '#34D399',
    '5': '#60A5FA',
    '6': '#C084FC',
    '7': '#F472B6',
  };
  
  return colors[corridorNumber] || '#A78BFA';
}
