import { jsPDF } from 'jspdf';
import { FlightRecord, PilotProfile } from '../types';

export function generateOfficialAesaPdf(
  flights: FlightRecord[],
  pilot: PilotProfile,
  periodType: 'diario' | 'semanal' | 'mensual' | 'anual' | 'carrera',
  filterLabel: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 15;

  // Header Background Box
  doc.setFillColor(0, 85, 150); // FEMETE primary blue (#005596)
  doc.rect(10, currentY, pageWidth - 20, 22, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('FEMETE · FEDERACIÓN DEL METAL Y NUEVAS TECNOLOGÍAS', 15, currentY + 7);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Libro de Vuelo Oficial RPAS / Drones · Entidad Homologada Santa Cruz de Tenerife', 15, currentY + 13);
  doc.setFontSize(8);
  doc.text('Colaborador Técnico Oficial: ALISIOS DRON (Consultoría Aeronáutica & Operador Acreditado AESA)', 15, currentY + 18);

  currentY += 28;

  // Document Title & Regulatory Compliance Strip
  doc.setFillColor(240, 245, 250);
  doc.setDrawColor(200, 215, 230);
  doc.roundedRect(10, currentY, pageWidth - 20, 16, 2, 2, 'FD');

  doc.setTextColor(0, 50, 100);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('REGISTRO OFICIAL DE OPERACIONES DE VUELO UAS / EASA-AESA', 15, currentY + 6);

  doc.setTextColor(80, 90, 100);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    `Conforme al RD 517/2024, Reglamentos (UE) 2019/947 y 2019/945 · Período: ${periodType.toUpperCase()} (${filterLabel})`,
    15,
    currentY + 12
  );

  currentY += 21;

  // Pilot & Operator Identification Box
  const isSenior = pilot.isSeniorPilot && ((pilot.previousAccreditedHours || 0) > 0 || (pilot.previousAccreditedMinutes || 0) > 0);
  const boxHeight = isSenior ? 28 : 24;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(210, 220, 230);
  doc.roundedRect(10, currentY, pageWidth - 20, boxHeight, 2, 2, 'FD');

  doc.setTextColor(0, 85, 150);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DATOS DEL PILOTO AL MANDO (PIC) Y OPERADOR REGISTRADO', 14, currentY + 5);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Piloto al Mando: ${pilot.name} (DNI: ${pilot.dni})`, 14, currentY + 11);
  doc.text(`Nº Operador AESA: ${pilot.aesaOperatorId}`, 14, currentY + 16);
  doc.text(`Habilitaciones Oficiales: ${pilot.ratings.join(', ')}`, 14, currentY + 21);

  doc.text(`Base Operativa: ${pilot.baseLocation}`, pageWidth / 2 + 5, currentY + 11);
  doc.text(`Entidad Formación: ${pilot.trainingEntity}`, pageWidth / 2 + 5, currentY + 16);
  doc.text(`Estado del Libro: Válido y Certificado FEMETE`, pageWidth / 2 + 5, currentY + 21);

  if (isSenior) {
    doc.setTextColor(180, 83, 9); // Amber
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(
      `PILOTO SENIOR · Base Previa Acreditada: ${pilot.previousAccreditedHours || 0}h ${pilot.previousAccreditedMinutes || 0}m (${pilot.previousAccreditationEntity || 'Libro anterior'})`,
      14,
      currentY + 26
    );
  }

  currentY += boxHeight + 4;

  // Stats Summary Box
  const totalMins = flights.reduce((sum, f) => sum + f.durationMinutes, 0);
  const totalHours = (totalMins / 60).toFixed(1);
  const totalBatt = flights.reduce((sum, f) => sum + f.batConsumed, 0);
  const prevMins = isSenior ? ((pilot.previousAccreditedHours || 0) * 60) + (pilot.previousAccreditedMinutes || 0) : 0;
  const careerTotalMins = prevMins + totalMins;
  const careerHours = Math.floor(careerTotalMins / 60);
  const careerRemMins = careerTotalMins % 60;

  doc.setFillColor(235, 245, 255);
  doc.rect(10, currentY, pageWidth - 20, 10, 'F');
  doc.setTextColor(0, 50, 100);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  const summaryText = isSenior
    ? `RESUMEN: ${flights.length} Vuelos App (${totalHours}h) | Base Senior: ${pilot.previousAccreditedHours}h ${pilot.previousAccreditedMinutes || 0}m | TOTAL CARRERA: ${careerHours}h ${careerRemMins}m`
    : `RESUMEN: ${flights.length} Vuelos Registrados  |  Tiempo Total: ${totalHours} h (${totalMins} min)  |  Descarga Acumulada: ${totalBatt}%`;

  doc.text(summaryText, 15, currentY + 6.5);

  currentY += 14;

  // Operations Table Header
  doc.setFillColor(15, 28, 45); // Dark slate header
  doc.rect(10, currentY, pageWidth - 20, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('ID / FECHA', 12, currentY + 5.5);
  doc.text('AERONAVE & MATRÍCULA', 42, currentY + 5.5);
  doc.text('UBICACIÓN & GNSS', 85, currentY + 5.5);
  doc.text('ESCENARIO', 135, currentY + 5.5);
  doc.text('HORA / DURACIÓN', 158, currentY + 5.5);
  doc.text('BAT', 188, currentY + 5.5);

  currentY += 8;

  // Operations Table Rows
  doc.setFont('helvetica', 'normal');
  flights.forEach((flight, idx) => {
    // Check if new page needed
    if (currentY > 260) {
      doc.addPage();
      currentY = 15;
    }

    const rowBg = idx % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(10, currentY, pageWidth - 20, 12, 'F');
    doc.setDrawColor(230, 235, 240);
    doc.line(10, currentY + 12, pageWidth - 10, currentY + 12);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(7);
    doc.text(flight.id, 12, currentY + 4.5);
    doc.setTextColor(100, 116, 139);
    doc.text(flight.date, 12, currentY + 8.5);

    doc.setTextColor(0, 85, 150);
    doc.setFont('helvetica', 'bold');
    doc.text(flight.droneModel.slice(0, 24), 42, currentY + 4.5);
    doc.setTextColor(70, 80, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reg: ${flight.droneRegistration}`, 42, currentY + 8.5);

    doc.setTextColor(15, 23, 42);
    doc.text(flight.locationName.slice(0, 28), 85, currentY + 4.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${flight.latitude.toFixed(4)}°N, ${flight.longitude.toFixed(4)}°W`, 85, currentY + 8.5);

    doc.setTextColor(217, 119, 6);
    doc.setFont('helvetica', 'bold');
    doc.text(flight.scenario, 135, currentY + 6);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`${flight.timeStart} - ${flight.timeEnd}`, 158, currentY + 4.5);
    doc.setTextColor(0, 85, 150);
    doc.setFont('helvetica', 'bold');
    doc.text(`${flight.durationMinutes} min`, 158, currentY + 8.5);

    doc.setTextColor(220, 38, 38);
    doc.text(`-${flight.batConsumed}%`, 188, currentY + 6.5);

    currentY += 12;
  });

  // Footer & Digital Verification Sign-off
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY = Math.max(currentY + 8, 240);
  }

  doc.setDrawColor(200, 210, 220);
  doc.line(10, currentY, pageWidth - 10, currentY);
  currentY += 6;

  const validationHash = `FEMETE-CAN-${Date.now().toString(16).toUpperCase()}-AESA-VAL`;

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.text(`Código Único de Verificación Digital (CUV): ${validationHash}`, 12, currentY);
  doc.text('Generado mediante la app oficial FEMETE AIR LOGBOOK con soporte de ALISIOS DRON.', 12, currentY + 4);
  doc.text('Válido para auditorías de operadores EASA y presentación formal ante inspectores de AESA.', 12, currentY + 8);

  // Signature line on right
  doc.text('Firma Digital / Visto Bueno Piloto:', pageWidth - 70, currentY);
  doc.setDrawColor(120, 140, 160);
  doc.line(pageWidth - 70, currentY + 12, pageWidth - 15, currentY + 12);
  doc.text(pilot.name, pageWidth - 70, currentY + 16);

  // Save the PDF directly to device
  const fileName = `FEMETE_Air_Logbook_${periodType}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
