const exportToPDF = async () => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');

      // 1. ดึงฟอนต์ภาษาไทยจาก Server หลักของ Google โดยตรง (ไม่มี Error 404 แน่นอน)
      const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/sarabun/Sarabun-Regular.ttf';
      const response = await fetch(fontUrl);
      const buffer = await response.arrayBuffer();
      
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Font = window.btoa(binary);

      // 2. ฝังฟอนต์เข้าไปใน PDF
      doc.addFileToVFS('Sarabun.ttf', base64Font);
      doc.addFont('Sarabun.ttf', 'Sarabun', 'normal');
      doc.setFont('Sarabun', 'normal');

      // 3. เริ่มวาด PDF (ใส่ภาษาไทยได้เลย)
      doc.setFontSize(18);
      doc.text('รายงานภาษีซื้อ', 148, 15, { align: 'center' }); 
      
      doc.setFontSize(14);
      doc.text('ชื่อผู้ประกอบการ: บจก. แอดเพย์ เซอร์วิสพอยท์', 14, 25);
      doc.text('เลขประจำตัวผู้เสียภาษี: 0345558001370 (สำนักงานใหญ่)', 14, 32);
      
      let monthLabel = 'ทั้งหมด';
      if (selectedMonth !== 'all') {
        const [year, month] = selectedMonth.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
        monthLabel = dateObj.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
      }
      doc.text(`เดือนภาษี: ${monthLabel}`, 14, 39);

      const tableColumn = [
        'ลำดับ', 'วัน/เดือน/ปี', 'เลขที่ใบกำกับ', 'ชื่อผู้ขาย', 
        'เลขผู้เสียภาษี', 'สาขา', 'มูลค่า (บ.)', 'VAT (บ.)', 'ยอดรวม (บ.)', 'หมายเหตุ'
      ];
      
      const tableRows = [];
      let totalNetSum = 0, totalVatSum = 0, totalGrandSum = 0;

      filteredPurchases.forEach((item, index) => {
        const totalAmount = parseFloat(item.total_amount || 0);
        const netAmount = totalAmount / 1.07;
        const vatAmount = totalAmount - netAmount;

        totalNetSum += netAmount;
        totalVatSum += vatAmount;
        totalGrandSum += totalAmount;

        tableRows.push([
          index + 1,
          new Date(item.purchase_date).toLocaleDateString('th-TH'),
          item.po_number || '-',
          item.vendor_name || '-',
          item.tax_id || '-',
          item.branch || '00000',
          netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
          vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
          totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
          item.notes || '-'
        ]);
      });

      tableRows.push([
        { content: 'รวม', colSpan: 6, styles: { halign: 'center', fontStyle: 'normal' } },
        totalNetSum.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        totalVatSum.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        totalGrandSum.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        ''
      ]);

      // วาดตารางด้วย autoTable
      autoTable(doc, {
        startY: 45,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: { font: 'Sarabun', fontSize: 12, fontStyle: 'normal' }, // บังคับใช้ฟอนต์ Sarabun
        headStyles: { fillColor: [242, 242, 242], textColor: [0, 0, 0], fontStyle: 'normal', halign: 'center' },
        columnStyles: {
          0: { halign: 'center', cellWidth: 12 },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'center', cellWidth: 30 },
          3: { cellWidth: 40 }, 
          4: { halign: 'center', cellWidth: 30 }, 
          5: { halign: 'center', cellWidth: 15 },
          6: { halign: 'right', cellWidth: 25 },
          7: { halign: 'right', cellWidth: 25 },
          8: { halign: 'right', cellWidth: 25 },
          9: { cellWidth: 'auto' } 
        }
      });

      const fileSuffix = selectedMonth !== 'all' ? selectedMonth : new Date().getTime();
      doc.save(`Report_Addpay_${fileSuffix}.pdf`);

    } catch (err) {
      console.error("สร้าง PDF ไม่สำเร็จ:", err);
      alert("เกิดข้อผิดพลาดในการดึงฟอนต์ โปรดตรวจสอบอินเทอร์เน็ต");
    } 
  };