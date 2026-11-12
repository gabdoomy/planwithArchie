import type { Guest, TableItem } from '../types/seating';
import { venueItemColors, venueItemDimensions, venueItemIcons, venueItemLabels } from '../venueItems';

export function exportVenuePDF(tables: TableItem[], eventName = 'Plan With Archie') {
  try {
    const totalGuests = tables.reduce((acc, t) => acc + t.guests.length, 0);
    const seatingTables = tables.filter(table => !table.venueType);
    const totalCapacity = seatingTables.reduce((acc, t) => acc + t.capacity, 0);

    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char] ?? char);

    const tableBounds = tables.map(table => {
      const scale = table.scale ?? 1;
      const dimensions = table.venueType
        ? venueItemDimensions[table.venueType]
        : {
            width: table.shape === 'round' ? 100 : table.shape === 'rectangle' ? 136 : 92,
            height: table.shape === 'round' ? 100 : table.shape === 'rectangle' ? 80 : 92
          };
      const width = dimensions.width *
        scale * (table.shape === 'rectangle' ? table.lengthScale ?? 1 : 1);
      const height = dimensions.height *
        scale * (table.shape === 'rectangle' ? table.widthScale ?? 1 : 1);
      const rotation = ((table.rotation ?? 0) * Math.PI) / 180;
      const extentX = Math.abs(Math.cos(rotation)) * (width / 2 + 27) +
        Math.abs(Math.sin(rotation)) * (height / 2 + 27);
      const extentY = Math.abs(Math.sin(rotation)) * (width / 2 + 27) +
        Math.abs(Math.cos(rotation)) * (height / 2 + 27);
      return {
        table,
        width,
        height,
        minX: table.x + width / 2 - extentX,
        maxX: table.x + width / 2 + extentX,
        minY: table.y + height / 2 - extentY,
        maxY: table.y + height / 2 + extentY
      };
    });

    const planMinX = Math.min(0, ...tableBounds.map(bounds => bounds.minX));
    const planMinY = Math.min(0, ...tableBounds.map(bounds => bounds.minY));
    const planMaxX = Math.max(900, ...tableBounds.map(bounds => bounds.maxX));
    const planMaxY = Math.max(650, ...tableBounds.map(bounds => bounds.maxY));
    const planPadding = 32;
    const planViewBox = `${planMinX - planPadding} ${planMinY - planPadding} ${planMaxX - planMinX + planPadding * 2} ${planMaxY - planMinY + planPadding * 2}`;

    const floorPlanSvg = tableBounds.map(({ table, width, height }) => {
      if (table.venueType) {
        const label = venueItemLabels[table.venueType];
        const fill = venueItemColors[table.venueType];
        const dash = table.venueType === 'dancefloor' ? ' stroke-dasharray="5 3"' : '';
        return `<g transform="translate(${table.x + width / 2} ${table.y + height / 2}) rotate(${table.rotation ?? 0})">
          <rect x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="10" fill="${fill}" fill-opacity="0.2" stroke="${fill}" stroke-width="2"${dash}/>
          <text x="0" y="-2" text-anchor="middle" font-size="12" font-weight="700" fill="#51463c">${escapeHtml(venueItemIcons[table.venueType])} ${escapeHtml(label)}</text>
          <text x="0" y="13" text-anchor="middle" font-size="8" fill="#817260">Venue area</text>
        </g>`;
      }

      const seats: { x: number; y: number; guest?: Guest; seatNum: number }[] = [];
      const chairSize = 24;

      if (table.shape === 'round') {
        const radius = width / 2;
        const chairDistance = radius + 15;
        for (let i = 0; i < table.capacity; i++) {
          const angle = (i * 2 * Math.PI) / table.capacity - Math.PI / 2;
          seats.push({
            x: radius + Math.cos(angle) * chairDistance - chairSize / 2,
            y: radius + Math.sin(angle) * chairDistance - chairSize / 2,
            seatNum: i + 1,
            guest: table.guests[i]
          });
        }
      } else if (table.shape === 'rectangle') {
        const topSeats = Math.ceil(table.capacity / 2);
        const bottomSeats = Math.floor(table.capacity / 2);
        for (let i = 0; i < topSeats; i++) {
          seats.push({
            x: 20 + ((width - 40) * (i + 0.5)) / topSeats - chairSize / 2,
            y: -chairSize / 2 - 3,
            seatNum: i + 1,
            guest: table.guests[i]
          });
        }
        for (let i = 0; i < bottomSeats; i++) {
          seats.push({
            x: 20 + ((width - 40) * (i + 0.5)) / bottomSeats - chairSize / 2,
            y: height - chairSize / 2 + 3,
            seatNum: topSeats + i + 1,
            guest: table.guests[topSeats + i]
          });
        }
      } else {
        const perimeter = 2 * (width + height);
        for (let i = 0; i < table.capacity; i++) {
          const position = ((i + 0.5) * perimeter) / table.capacity;
          let x: number;
          let y: number;
          if (position < width) {
            x = position - chairSize / 2;
            y = -chairSize - 3;
          } else if (position < width + height) {
            x = width + 3;
            y = position - width - chairSize / 2;
          } else if (position < 2 * width + height) {
            x = width - (position - width - height) - chairSize / 2;
            y = height + 3;
          } else {
            x = -chairSize - 3;
            y = height - (position - 2 * width - height) - chairSize / 2;
          }
          seats.push({ x, y, seatNum: i + 1, guest: table.guests[i] });
        }
      }

      const chairs = seats.map(seat => {
        const guest = seat.guest;
        const fill = guest ? guest.isVip ? '#eee1c9' : '#766354' : '#fcf9f2';
        const stroke = guest?.isVip ? '#ad9166' : guest ? '#766354' : '#d8cbb8';
        const text = guest
          ? guest.name.trim().split(/\s+/).filter(Boolean)
              .map(part => part[0]).slice(0, 2).join('').toUpperCase()
          : String(seat.seatNum);
        return `<g><rect x="${seat.x}" y="${seat.y}" width="${chairSize}" height="${chairSize}" rx="${chairSize / 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><text x="${seat.x + chairSize / 2}" y="${seat.y + chairSize / 2 + 3}" text-anchor="middle" font-size="7" font-weight="700" fill="${guest?.isVip ? '#705b3d' : guest ? '#fffaf2' : '#84796d'}">${escapeHtml(text)}</text></g>`;
      }).join('');

      const surface = table.shape === 'round'
        ? `<circle cx="${width / 2}" cy="${height / 2}" r="${width / 2}" />`
        : `<rect x="0" y="0" width="${width}" height="${height}" rx="10" />`;

      return `<g transform="translate(${table.x + width / 2} ${table.y + height / 2}) rotate(${table.rotation ?? 0}) translate(${-width / 2} ${-height / 2})">
        <g class="table-surface">${surface}</g>
        ${chairs}
        <g><text class="floor-table-name" x="${width / 2}" y="${height / 2 - 3}" text-anchor="middle">${escapeHtml(table.name)}</text><text class="table-count" x="${width / 2}" y="${height / 2 + 12}" text-anchor="middle">${table.guests.length} / ${table.capacity} seats</text></g>
      </g>`;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(eventName)} - Wedding Seating Chart</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif; padding: 20px; color: #51463c; background: #fff; margin: 0; }
          .header { border-bottom: 2px solid #b8a48c; padding-bottom: 12px; margin-bottom: 20px; }
          h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 4px 0; color: #51463c; }
          .subtitle { font-size: 13px; color: #84796d; font-weight: 500; }
          .metrics { display: flex; gap: 24px; background: #f4edde; padding: 14px 20px; border-radius: 8px; margin-bottom: 24px; }
          .metric-box { flex: 1; }
          .metric-label { font-size: 10px; font-weight: bold; color: #84796d; text-transform: uppercase; }
          .metric-value { font-size: 16px; font-weight: bold; color: #51463c; margin-top: 2px; }
          .table-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .table-card { border: 1px solid #e5d9c8; border-radius: 10px; padding: 14px; background: #fcf9f2; page-break-inside: avoid; }
          .table-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e9dfd0; padding-bottom: 8px; margin-bottom: 10px; }
          .table-name { font-weight: bold; font-size: 15px; }
          .table-shape { font-size: 11px; color: #84796d; text-transform: uppercase; font-weight: 600; }
          .guest-row { display: flex; justify-content: space-between; font-size: 12px; padding: 5px 0; border-bottom: 1px dashed #e9dfd0; }
          .vip-tag { font-size: 9px; font-weight: bold; background: #eee1c9; color: #705b3d; padding: 2px 6px; border-radius: 4px; margin-left: 6px; }
          .diet-tag { font-size: 10px; font-weight: bold; color: #a35f59; }
          .footer { margin-top: 30px; font-size: 11px; color: #9a8d7c; text-align: center; border-top: 1px solid #e5d9c8; padding-top: 14px; }
          .floor-plan { page-break-before: always; break-before: page; page-break-inside: avoid; padding-top: 16px; }
          .floor-plan h2 { color: #51463c; font-size: 22px; margin: 0 0 4px; }
          .floor-plan-note { color: #84796d; font-size: 11px; margin-bottom: 12px; }
          .floor-plan svg { display: block; width: 100%; height: 5.8in; border: 1px solid #e5d9c8; border-radius: 8px; background: #f4edde; }
          .table-surface rect, .table-surface circle { fill: #fcf9f2; stroke: #b8a48c; stroke-width: 2; }
          .floor-table-name { fill: #51463c; font-size: 12px; font-weight: 700; }
          .table-count { fill: #84796d; font-size: 9px; font-weight: 600; }
          .plan-legend { display: flex; gap: 18px; font-size: 10px; color: #817260; margin-top: 10px; }
          .legend-item { display: inline-flex; align-items: center; gap: 5px; }
          .legend-marker { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; box-sizing: border-box; font-size: 9px; font-weight: 700; }
          .legend-open { background: #fcf9f2; border: 1.5px solid #d8cbb8; }
          .legend-guest { background: #766354; border: 1.5px solid #766354; color: #fffaf2; }
          .legend-vip { background: #ad9166; border: 1.5px solid #ad9166; color: #705b3d; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>WEDDING SEATING CHART & VENUE SPECIFICATION</h1>
          <div class="subtitle">Official Venue Manifest & Floor Plan Allocation · Generated via ${escapeHtml(eventName)}</div>
        </div>

        <div class="metrics">
          <div class="metric-box">
            <div class="metric-label">Total Tables</div>
            <div class="metric-value">${seatingTables.length} Active Tables · ${tables.length - seatingTables.length} Venue Areas</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Seated Guests</div>
            <div class="metric-value">${totalGuests} / ${totalCapacity} Seats (${Math.round((totalGuests / Math.max(1, totalCapacity)) * 100)}%)</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Date Generated</div>
            <div class="metric-value">${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="table-grid">
          ${seatingTables.map((t, idx) => `
            <div class="table-card">
              <div class="table-header">
                <span class="table-name">Table ${idx + 1}: ${escapeHtml(t.name)}</span>
                <span class="table-shape">${t.shape} · ${t.guests.length}/${t.capacity}</span>
              </div>
              ${t.guests.length === 0 ? '<div style="font-size: 12px; color: #9a8d7c; font-style: italic;">No guests seated yet</div>' : ''}
              ${t.guests.map((g, sIdx) => `
                <div class="guest-row">
                  <span>
                    <strong>Seat ${sIdx + 1}:</strong> ${escapeHtml(g.name)}
                    ${g.isVip ? '<span class="vip-tag">VIP</span>' : ''}
                  </span>
                  ${g.dietary ? `<span class="diet-tag">${escapeHtml(g.dietary)}</span>` : ''}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>

        <section class="floor-plan">
          <div class="header">
            <h2>Seating Plan</h2>
          </div>
          <div class="floor-plan-note">Floor-plan view showing table layout, orientation, seats and assigned guests.</div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="${planViewBox}" preserveAspectRatio="xMidYMid meet">
            ${floorPlanSvg}
          </svg>
          <div class="plan-legend">
            <span class="legend-item"><span class="legend-marker legend-open"></span>Open seat</span>
            <span class="legend-item"><span class="legend-marker legend-guest">G</span>Guest</span>
            <span class="legend-item"><span class="legend-marker legend-vip">★</span>VIP</span>
          </div>
        </section>

        <div class="footer">
          ${escapeHtml(eventName)} Seating System · For Wedding Planner, Venue Captain & Kitchen Staff
        </div>
      </body>
      </html>
    `;

    // Open print window / iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 2000);
      }, 300);
    }
  } catch (err: any) {
    alert(`PDF Export Failed: ${err?.message || 'Error printing PDF'}`);
  }
}
