import { jsPDF } from 'jspdf';
import { SeatingPlan, Table, Guest, VenueFixture } from '../types/seating';

export function exportVenuePDF(plan: SeatingPlan) {
  // Create PDF in Landscape A4 (297mm x 210mm) for optimal floor plan & tables
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // Primary colors
  const primaryColor = [20, 24, 33]; // deep obsidian
  const secondaryColor = [100, 116, 139]; // slate
  const goldColor = [180, 140, 80]; // champagne gold
  const lightBg = [248, 250, 252];

  // Calculate statistics
  const totalTables = plan.tables.length;
  const totalGuests = plan.guests.length;
  const seatedGuests = plan.guests.filter(g => g.tableId !== null);
  const unseatedGuests = plan.guests.filter(g => g.tableId === null);
  const totalCapacity = plan.tables.reduce((acc, t) => acc + t.capacity, 0);

  const dietaryCounts = plan.guests.reduce((acc, g) => {
    if (g.dietary && g.dietary !== 'none') {
      acc[g.dietary] = (acc[g.dietary] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // ================= PAGE 1: VENUE FLOOR PLAN & SPECIFICATION =================
  // Header Bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(plan.weddingName.toUpperCase(), 16, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 210, 220);
  doc.text(`VENUE FLOOR PLAN & SPECIFICATION  |  ${plan.venueName}  |  ${plan.date}`, 16, 18);

  // Right side header info
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 16, 15, { align: 'right' });

  // Summary Metrics Strip
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(16, 28, pageWidth - 32, 16, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(16, 28, pageWidth - 32, 16, 2, 2, 'S');

  const statCols = [
    { label: 'TOTAL GUESTS', val: `${totalGuests} registered (${seatedGuests.length} seated)` },
    { label: 'TABLE COUNT', val: `${totalTables} tables (${totalCapacity} total seats)` },
    { label: 'OCCUPANCY', val: `${Math.round((seatedGuests.length / Math.max(1, totalCapacity)) * 100)}% utilization` },
    { label: 'SPECIAL DIETS', val: `${Object.values(dietaryCounts).reduce((a, b) => a + b, 0)} catering alerts` }
  ];

  statCols.forEach((stat, idx) => {
    const x = 24 + idx * 66;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(stat.label, x, 34);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(stat.val, x, 40);
  });

  // Floor Plan Diagram Box
  const canvasX = 16;
  const canvasY = 48;
  const canvasW = pageWidth - 32;
  const canvasH = 148;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(canvasX, canvasY, canvasW, canvasH, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(canvasX, canvasY, canvasW, canvasH, 2, 2, 'S');

  // Blueprint grid pattern (subtle dotted lines)
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.2);
  for (let gx = canvasX + 15; gx < canvasX + canvasW; gx += 15) {
    doc.line(gx, canvasY, gx, canvasY + canvasH);
  }
  for (let gy = canvasY + 15; gy < canvasY + canvasH; gy += 15) {
    doc.line(canvasX, gy, canvasX + canvasW, gy);
  }

  // Calculate scaling factor from plan canvas (1600x1100 approx) to PDF canvas (canvasW x canvasH)
  const scaleX = (canvasW - 20) / plan.canvasWidth;
  const scaleY = (canvasH - 20) / plan.canvasHeight;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = canvasX + (canvasW - plan.canvasWidth * scale) / 2;
  const offsetY = canvasY + (canvasH - plan.canvasHeight * scale) / 2;

  // Draw Fixtures
  plan.fixtures.forEach(fixture => {
    const fx = offsetX + fixture.x * scale;
    const fy = offsetY + fixture.y * scale;
    const fw = fixture.width * scale;
    const fh = fixture.height * scale;

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.4);

    if (fixture.type === 'dance_floor') {
      doc.setFillColor(250, 245, 235);
      doc.setDrawColor(217, 180, 110);
      doc.roundedRect(fx, fy, fw, fh, 2, 2, 'FD');
    } else if (fixture.type === 'stage_dj') {
      doc.setFillColor(238, 242, 255);
      doc.setDrawColor(165, 180, 252);
      doc.roundedRect(fx, fy, fw, fh, 2, 2, 'FD');
    } else if (fixture.type === 'bar') {
      doc.setFillColor(243, 232, 255);
      doc.setDrawColor(216, 180, 254);
      doc.roundedRect(fx, fy, fw, fh, 2, 2, 'FD');
    } else {
      doc.roundedRect(fx, fy, fw, fh, 2, 2, 'FD');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(fixture.label.toUpperCase(), fx + fw / 2, fy + fh / 2 + 1, { align: 'center' });
  });

  // Draw Tables
  plan.tables.forEach((table, idx) => {
    const tx = offsetX + table.x * scale;
    const ty = offsetY + table.y * scale;
    const seatedCount = plan.guests.filter(g => g.tableId === table.id).length;

    // Chair and table dimensions in mm
    doc.setLineWidth(0.4);

    if (table.shape === 'round') {
      const radius = 9; // ~18mm diameter
      // Table surface
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.circle(tx, ty, radius, 'FD');

      // Draw chairs as small circles around table
      const chairDistance = radius + 3;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(148, 163, 184);
      for (let i = 0; i < table.capacity; i++) {
        const angle = (i * 2 * Math.PI) / table.capacity - Math.PI / 2;
        const cx = tx + Math.cos(angle) * chairDistance;
        const cy = ty + Math.sin(angle) * chairDistance;
        doc.circle(cx, cy, 1.4, 'FD');
      }

      // Table text label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`T${idx + 1}`, tx, ty - 1, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`${seatedCount}/${table.capacity}`, tx, ty + 2.5, { align: 'center' });
      doc.text(table.name.substring(0, 16), tx, ty + radius + 6.5, { align: 'center' });

    } else if (table.shape === 'rectangle') {
      const rw = 26;
      const rh = 14;
      const rx = tx - rw / 2;
      const ry = ty - rh / 2;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.roundedRect(rx, ry, rw, rh, 1.5, 1.5, 'FD');

      // Chairs on top and bottom sides
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(148, 163, 184);
      const halfCap = Math.ceil(table.capacity / 2);
      for (let i = 0; i < halfCap; i++) {
        const cx = rx + ((i + 0.5) * rw) / halfCap;
        doc.circle(cx, ry - 2.5, 1.3, 'FD');
        doc.circle(cx, ry + rh + 2.5, 1.3, 'FD');
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`T${idx + 1}`, tx, ty - 1, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`${seatedCount}/${table.capacity}`, tx, ty + 2.5, { align: 'center' });
      doc.text(table.name.substring(0, 18), tx, ty + rh / 2 + 6, { align: 'center' });

    } else {
      // Square table
      const sw = 16;
      const sh = 16;
      const sx = tx - sw / 2;
      const sy = ty - sh / 2;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.roundedRect(sx, sy, sw, sh, 1.5, 1.5, 'FD');

      // Chairs on four edges
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(148, 163, 184);
      doc.circle(tx, sy - 2.5, 1.3, 'FD');
      doc.circle(tx, sy + sh + 2.5, 1.3, 'FD');
      doc.circle(sx - 2.5, ty, 1.3, 'FD');
      doc.circle(sx + sw + 2.5, ty, 1.3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`T${idx + 1}`, tx, ty - 1, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`${seatedCount}/${table.capacity}`, tx, ty + 2.5, { align: 'center' });
      doc.text(table.name.substring(0, 14), tx, ty + sh / 2 + 6, { align: 'center' });
    }
  });

  // Footer on Page 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Page 1 of 3  |  AislePlan Seating Architecture System  |  For Venue Staff & Event Coordinators`, 16, pageHeight - 6);


  // ================= PAGE 2: TABLE-BY-TABLE GUEST MANIFEST =================
  doc.addPage('a4', 'landscape');

  // Header Bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('TABLE-BY-TABLE SEATING MANIFEST', 16, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 210, 220);
  doc.text(`${plan.weddingName}  ·  ${plan.venueName}`, pageWidth - 16, 12, { align: 'right' });

  // Grid of tables: 2 columns of tables on the page
  const colWidth = (pageWidth - 38) / 2;
  let currentY = 28;
  let colIndex = 0;

  plan.tables.forEach((table, tIdx) => {
    const tableGuests = plan.guests.filter(g => g.tableId === table.id);
    const boxHeight = 12 + Math.max(1, table.capacity) * 5.5 + 4;

    // Check if we need to switch column or add new page
    if (currentY + boxHeight > pageHeight - 14) {
      if (colIndex === 0) {
        colIndex = 1;
        currentY = 28;
      } else {
        doc.addPage('a4', 'landscape');
        // New header
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text('TABLE-BY-TABLE SEATING MANIFEST (CONTINUED)', 16, 12);
        colIndex = 0;
        currentY = 28;
      }
    }

    const startX = 16 + colIndex * (colWidth + 6);

    // Table Container Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(startX, currentY, colWidth, boxHeight, 2, 2, 'FD');

    // Table Header inside box
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(startX, currentY, colWidth, 9, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Table ${tIdx + 1}: ${table.name}`, startX + 4, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`${table.shape.toUpperCase()}  ·  ${tableGuests.length}/${table.capacity} SEATS`, startX + colWidth - 4, currentY + 6, { align: 'right' });

    // Table Guests List
    let rowY = currentY + 14;
    for (let s = 1; s <= table.capacity; s++) {
      const guest = tableGuests.find(g => g.seatNumber === s) || tableGuests[s - 1];

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`Seat ${s}`, startX + 4, rowY);

      if (guest) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(guest.name, startX + 18, rowY);

        if (guest.isVip) {
          doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
          doc.text('(VIP)', startX + 60, rowY);
        }

        if (guest.dietary && guest.dietary !== 'none') {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(220, 38, 38);
          doc.text(`[${guest.dietary.replace('_', ' ').toUpperCase()}]`, startX + colWidth - 4, rowY, { align: 'right' });
        }
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(180, 190, 200);
        doc.text('— Available Seat —', startX + 18, rowY);
      }

      rowY += 5.5;
    }

    currentY += boxHeight + 4;
  });

  // ================= PAGE 3: MASTER ALPHABETICAL GUEST DIRECTORY & CATERING =================
  doc.addPage('a4', 'landscape');

  // Header Bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('ALPHABETICAL GUEST DIRECTORY & CATERING SUMMARY', 16, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 210, 220);
  doc.text('Door Host Stand & Maitre D\' Master List', pageWidth - 16, 12, { align: 'right' });

  // Catering Summary Card on Left Top
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(16, 26, 85, 46, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('KITCHEN CATERING TALLY', 20, 33);

  const dietaryKeys = Object.keys(dietaryCounts);
  if (dietaryKeys.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('No special dietary restrictions reported.', 20, 42);
  } else {
    dietaryKeys.forEach((key, kIdx) => {
      const dy = 40 + kIdx * 5;
      if (dy < 68) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(key.replace('_', ' ').toUpperCase(), 20, dy);
        doc.setFont('helvetica', 'bold');
        doc.text(`${dietaryCounts[key]} meals`, 95, dy, { align: 'right' });
      }
    });
  }

  // Unassigned Guests Notice
  if (unseatedGuests.length > 0) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(16, 76, 85, 120, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(185, 28, 28);
    doc.text(`UNASSIGNED GUESTS (${unseatedGuests.length})`, 20, 83);

    unseatedGuests.slice(0, 18).forEach((ug, idx) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(127, 29, 29);
      doc.text(`${idx + 1}. ${ug.name} (${ug.group})`, 20, 90 + idx * 5.5);
    });
  }

  // 2-Column Alphabetical Directory Table
  const sortedGuests = [...plan.guests].sort((a, b) => a.name.localeCompare(b.name));
  const dirColWidth = 85;
  const dirStartX = unseatedGuests.length > 0 ? 108 : 16;
  const dirColCount = unseatedGuests.length > 0 ? 2 : 3;

  let gCol = 0;
  let gRowY = 32;

  // Header for Directory
  for (let c = 0; c < dirColCount; c++) {
    const headerX = dirStartX + c * (dirColWidth + 6);
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(headerX, 26, dirColWidth, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('GUEST NAME', headerX + 2, 30);
    doc.text('TABLE / SEAT', headerX + dirColWidth - 2, 30, { align: 'right' });
  }

  sortedGuests.forEach((guest) => {
    const table = plan.tables.find(t => t.id === guest.tableId);
    const currX = dirStartX + gCol * (dirColWidth + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(guest.name, currX + 2, gRowY);

    if (table) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      const seatText = guest.seatNumber ? `T: ${table.name.substring(0, 10)} · S${guest.seatNumber}` : table.name.substring(0, 14);
      doc.text(seatText, currX + dirColWidth - 2, gRowY, { align: 'right' });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Unassigned', currX + dirColWidth - 2, gRowY, { align: 'right' });
    }

    gRowY += 4.8;
    if (gRowY > pageHeight - 12) {
      gRowY = 32;
      gCol++;
      if (gCol >= dirColCount) {
        // Can stop or wrap
      }
    }
  });

  // Save the PDF
  const safeTitle = (plan.weddingName || 'Wedding_Seating_Plan').replace(/[^a-z0-9_-]/gi, '_');
  doc.save(`${safeTitle}_Venue_Floorplan_Seating.pdf`);
}
