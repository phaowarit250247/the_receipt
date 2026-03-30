import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { BaseURL } from '../../endpoint/URL';
import XLSX from 'xlsx-js-style';
// import jsPDF from 'jspdf';  // ลบอันนี้
// import autoTable from 'jspdf-autotable';  // ลบอันนี้
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {
  Search, Loader2, FileText, Calendar,
  Store, ChevronRight, ChevronLeft, Plus, ArrowLeft, Download, FileDown
} from 'lucide-react';
export default function PurchaseList() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false); // 🚀 เพิ่ม State โหลดตอนทำ PDF

  // States สำหรับ Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  // States สำหรับ Pagination (แบ่งหน้า)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchPurchases = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${BaseURL}/purchases`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPurchases(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab, selectedMonth, itemsPerPage]);

  const availableMonths = useMemo(() => {
    return [...new Set(purchases
      .filter(p => p.purchase_date)
      .map(p => {
        const d = new Date(p.purchase_date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      })
    )].sort().reverse();
  }, [purchases]);

  const tabCounts = useMemo(() => {
    let all = 0;
    let normal = 0;
    let tax = 0;

    purchases.forEach(p => {
      let matchesMonth = true;
      if (selectedMonth !== 'all') {
        const pDate = p.purchase_date ? new Date(p.purchase_date) : null;
        const pMonth = pDate ? `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}` : null;
        matchesMonth = pMonth === selectedMonth;
      }

      if (matchesMonth) {
        all++;
        if (p.receipt_type === 'normal') normal++;
        if (p.receipt_type === 'tax_invoice') tax++;
      }
    });

    return { all, normal, tax_invoice: tax };
  }, [purchases, selectedMonth]);

  const filteredPurchases = useMemo(() => {
    const lowerSearch = debouncedSearch.toLowerCase();

    return purchases.filter(p => {
      if (activeTab !== 'all' && p.receipt_type !== activeTab) return false;

      if (selectedMonth !== 'all') {
        const pDate = p.purchase_date || '';
        if (!pDate.startsWith(selectedMonth)) {
          const d = new Date(pDate);
          const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (mKey !== selectedMonth) return false;
        }
      }

      if (lowerSearch) {
        const po = (p.po_number || '').toLowerCase();
        const vendor = (p.vendor_name || '').toLowerCase();
        if (!po.includes(lowerSearch) && !vendor.includes(lowerSearch)) return false;
      }

      return true;
    });
  }, [purchases, debouncedSearch, activeTab, selectedMonth]);

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredPurchases.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return (
    <div className="h-screen flex items-center justify-center dark:bg-slate-950">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  Export Excel
  // ─────────────────────────────────────────────────────────────────────────
  const exportToExcel = () => {
    const data = [];
    const merges = [];
    let currentRow = 0;

    data.push(['รายงานภาษีซื้อ', '', '', '', '', '', '', '', '', '']);
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 9 } });
    currentRow++;

    data.push(['ชื่อผู้ประกอบการ', '', 'บจก. แอดเพย์ เซอร์วิสพอยท์', '', '', '', '', '', '', '']);
    currentRow++;

    data.push(['เลขประจำตัวผู้เสียภาษี', '', '0345558001370 (สำนักงานใหญ่)', '', '', '', '', '', '', '']);
    currentRow++;

    let monthLabel = 'ทั้งหมด';
    if (selectedMonth !== 'all') {
      const [year, month] = selectedMonth.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
      monthLabel = dateObj.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
    }
    data.push(['เดือนภาษี', '', monthLabel, '', '', '', '', '', '', '']);
    currentRow++;

    const tableHeader = [
      'ลำดับ', 'วัน/เดือน/ปี', 'เลขที่ใบกำกับภาษี', 'ชื่อผู้ขายสินค้า / ผู้ให้บริการ',
      'เลขประจำตัวผู้เสียภาษี', 'สาขา', 'มูลค่าสินค้า\nหรือบริการ', 'จำนวนเงิน\nภาษีมูลค่าเพิ่ม', 'ยอดรวม', 'หมายเหตุ'
    ];

    data.push(tableHeader);
    data.push(['', '', '', '', '', '', '', '', '', '']);

    const headerRowStartIndex = currentRow;
    const headerRowEndIndex = currentRow + 1;

    for (let i = 0; i < tableHeader.length; i++) {
      merges.push({ s: { r: headerRowStartIndex, c: i }, e: { r: headerRowEndIndex, c: i } });
    }

    currentRow += 2;

    let totalNetSum = 0;
    let totalVatSum = 0;
    let totalGrandSum = 0;

    filteredPurchases.forEach((item, index) => {
      const totalAmount = parseFloat(item.total_amount || 0);
      const netAmount = totalAmount / 1.07;
      const vatAmount = totalAmount - netAmount;

      totalNetSum += netAmount;
      totalVatSum += vatAmount;
      totalGrandSum += totalAmount;

      data.push([
        index + 1,
        new Date(item.purchase_date).toLocaleDateString('th-TH'),
        item.po_number || '-',
        item.vendor_name || '-',
        item.tax_id || '-',
        item.branch || '00000',
        netAmount,
        vatAmount,
        totalAmount,
        item.notes || '-'
      ]);
      currentRow++;
    });

    data.push(['รวม', '', '', '', '', '', totalNetSum, totalVatSum, totalGrandSum, '']);
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 5 } });

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet['!merges'] = merges;

    worksheet['!cols'] = [
      { wch: 8 }, { wch: 15 }, { wch: 20 }, { wch: 35 }, { wch: 20 },
      { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 25 }
    ];

    const getCell = (r, c) => {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };
      if (!worksheet[cellRef].s) worksheet[cellRef].s = {};
      return worksheet[cellRef];
    };

    const titleCell = getCell(0, 0);
    titleCell.s = { font: { bold: true, size: 16 }, alignment: { horizontal: "center" } };

    for (let r = headerRowStartIndex; r <= currentRow; r++) {
      for (let c = 0; c < 10; c++) {
        const cell = getCell(r, c);

        cell.s.border = {
          top: { style: "thin" }, bottom: { style: "thin" },
          left: { style: "thin" }, right: { style: "thin" }
        };
        cell.s.font = { name: 'Arial', size: 10 };

        if (r === headerRowStartIndex || r === headerRowEndIndex) {
          cell.s.fill = { fgColor: { rgb: "F2F2F2" } };
          cell.s.font.bold = true;
          cell.s.alignment = { horizontal: "center", vertical: "center", wrapText: true };
        } else if (r === currentRow) {
          cell.s.font.bold = true;
          if (c === 0) {
            cell.s.alignment = { horizontal: "center", vertical: "center" };
          } else if (c >= 6 && c <= 8) {
            cell.t = 'n';
            cell.z = '#,##0.00';
            cell.s.alignment = { horizontal: "right" };
          }
        } else if (c >= 6 && c <= 8) {
          cell.t = 'n';
          cell.z = '#,##0.00';
          cell.s.alignment = { horizontal: "right" };
        } else {
          cell.s.alignment = { horizontal: "center" };
          if (c === 3 || c === 9) cell.s.alignment = { horizontal: "left" };
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'รายงานภาษีซื้อ');
    const fileSuffix = selectedMonth !== 'all' ? selectedMonth : new Date().getTime();
    XLSX.writeFile(workbook, `Report_Addpay_${fileSuffix}.xlsx`);
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  🚀 [อัปเดต] Export PDF รองรับภาษาไทย 100%
  // ─────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  //  🚀 [ALTERNATIVE] Export PDF - Simplified Version
  // ─────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  //  🚀 [FIXED] Export PDF ด้วย pdf-lib รองรับภาษาไทย 100%
  // ─────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  //  🚀 [FIXED] Export PDF ด้วย jsPDF + html2canvas (ง่ายที่สุด)
  // ─────────────────────────────────────────────────────────────────────────


  const exportToPDF = async () => {
    setIsExportingPDF(true);
    try {
      // สร้าง HTML element ชั่วคราวสำหรับทำ PDF
      const printContent = document.createElement('div');
      printContent.style.padding = '20px';
      printContent.style.backgroundColor = 'white';
      printContent.style.fontFamily = 'sans-serif';

      // สร้าง HTML สำหรับ PDF
      let monthLabel = 'ทั้งหมด';
      if (selectedMonth !== 'all') {
        const [year, month] = selectedMonth.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
        monthLabel = dateObj.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
      }

      let totalNetSum = 0;
      let totalVatSum = 0;
      let totalGrandSum = 0;

      let tableRows = '';
      filteredPurchases.forEach((item, index) => {
        const totalAmount = parseFloat(item.total_amount || 0);
        const netAmount = totalAmount / 1.07;
        const vatAmount = totalAmount - netAmount;

        totalNetSum += netAmount;
        totalVatSum += vatAmount;
        totalGrandSum += totalAmount;

        tableRows += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${new Date(item.purchase_date).toLocaleDateString('th-TH')}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.po_number || '-'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.vendor_name || '-'}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.tax_id || '-'}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.branch || '00000'}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${netAmount.toFixed(2)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${vatAmount.toFixed(2)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${totalAmount.toFixed(2)}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.notes || '-'}</td>
        </tr>
      `;
      });

      // เพิ่มแถวรวม
      tableRows += `
      <tr style="font-weight: bold; background-color: #f2f2f2;">
        <td colspan="6" style="border: 1px solid #ddd; padding: 8px; text-align: center;">รวม</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${totalNetSum.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${totalVatSum.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${totalGrandSum.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
      </tr>
    `;

      printContent.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
        body {
          font-family: 'Sarabun', sans-serif;
          margin: 0;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .company-info {
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th {
          background-color: #f2f2f2;
          border: 1px solid #ddd;
          padding: 10px;
          text-align: center;
          font-weight: bold;
        }
        td {
          border: 1px solid #ddd;
          padding: 8px;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
        }
      </style>
      <div class="header">
        <h2>รายงานภาษีซื้อ</h2>
      </div>
      <div class="company-info">
        <div><strong>ชื่อผู้ประกอบการ:</strong> บจก. แอดเพย์ เซอร์วิสพอยท์</div>
        <div><strong>เลขประจำตัวผู้เสียภาษี:</strong> 0345558001370 (สำนักงานใหญ่)</div>
        <div><strong>เดือนภาษี:</strong> ${monthLabel}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>วัน/เดือน/ปี</th>
            <th>เลขที่ใบกำกับ</th>
            <th>ชื่อผู้ขาย</th>
            <th>เลขผู้เสียภาษี</th>
            <th>สาขา</th>
            <th>มูลค่า (บ.)</th>
            <th>VAT (บ.)</th>
            <th>ยอดรวม (บ.)</th>
            <th>หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

      document.body.appendChild(printContent);

      // ใช้ html2canvas จับภาพและสร้าง PDF
      const canvas = await html2canvas(printContent, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

      const fileSuffix = selectedMonth !== 'all' ? selectedMonth : new Date().getTime();
      doc.save(`Report_Addpay_${fileSuffix}.pdf`);

      document.body.removeChild(printContent);

    } catch (err) {
      console.error("PDF export error:", err);
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setIsExportingPDF(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft size={18} className="text-slate-600" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white border-l-4 border-[#EA580C] pl-3">
              รายการคำสั่งซื้อ (Addpay)
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">

            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="ค้นหา..."
                className="pl-9 pr-3 py-1.5 w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-[#EA580C]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="py-1.5 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white outline-none focus:border-[#EA580C] cursor-pointer"
            >
              <option value="all">📅 ทุกเดือน</option>
              {availableMonths.map(monthValue => {
                const [year, month] = monthValue.split('-');
                const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
                const label = dateObj.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' });
                return <option key={monthValue} value={monthValue}>{label}</option>
              })}
            </select>

            <button
              onClick={() => navigate('/purchases/add')}
              className="bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium transition shadow-sm whitespace-nowrap"
            >
              <Plus size={16} /> เพิ่มใบสั่งซื้อ
            </button>

            <button
              onClick={exportToPDF}
              disabled={isExportingPDF}
              className="bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-slate-400 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium transition shadow-sm whitespace-nowrap"
              title="Export to PDF"
            >
              {isExportingPDF ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
              {isExportingPDF ? 'กำลังสร้าง...' : 'PDF'}
            </button>

            <button
              onClick={exportToExcel}
              className="bg-[#10B981] hover:bg-[#059669] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium transition shadow-sm whitespace-nowrap"
              title="Export to Excel"
            >
              <Download size={16} /> Excel
            </button>
          </div>
        </div>

        {/* Tab Filter */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-md rounded-[1.5rem] w-fit mb-8 border border-white dark:border-slate-700">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.2rem] text-sm font-black transition-all cursor-pointer ${activeTab === 'all'
              ? 'bg-white dark:bg-slate-700 text-[#172554] shadow-md scale-105'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            📋 ดูทั้งหมด
            <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'all' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'bg-slate-200 dark:bg-slate-900 text-slate-400'}`}>
              {tabCounts.all}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('normal')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.2rem] text-sm font-black transition-all cursor-pointer ${activeTab === 'normal'
              ? 'bg-white dark:bg-slate-700 text-[#1D4ED8] shadow-md scale-105'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            📄 ใบเสร็จธรรมดา
            <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'normal' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'bg-slate-200 dark:bg-slate-900 text-slate-400'}`}>
              {tabCounts.normal}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tax_invoice')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.2rem] text-sm font-black transition-all cursor-pointer ${activeTab === 'tax_invoice'
              ? 'bg-white dark:bg-slate-700 text-[#EA580C] shadow-md scale-105'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            🧾 ใบกำกับภาษี
            <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'tax_invoice' ? 'bg-[#FFF7ED] text-[#EA580C]' : 'bg-slate-200 dark:bg-slate-900 text-slate-400'}`}>
              {tabCounts.tax_invoice}
            </span>
          </button>
        </div>

        {/* Purchase Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] dark:bg-slate-800/50 text-[#475569] dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">เลขที่</th>
                  <th className="px-4 py-3">วันที่ซื้อ</th>
                  <th className="px-4 py-3">ร้านค้า</th>
                  <th className="px-4 py-3">ประเภทใบเสร็จ</th>
                  <th className="px-4 py-3 text-right">ยอดสุทธิ</th>
                  <th className="px-4 py-3">ประกันหมด</th>
                  <th className="px-4 py-3 text-center">ดูข้อมูล</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-slate-200">
                      {item.po_number}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {new Date(item.purchase_date).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col">
                        <span className="text-slate-700 dark:text-slate-300 font-medium line-clamp-1">{item.vendor_name}</span>
                        <span className="text-[11px] text-slate-400">{item.branch || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[12px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-tight ${item.receipt_type === 'tax_invoice'
                        ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] dark:bg-orange-900/30 dark:border-orange-900/50'
                        : 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE] dark:bg-blue-900/30 dark:border-blue-900/50'
                        }`}>
                        {item.receipt_type === 'tax_invoice' ? 'ใบกำกับภาษี' : 'ใบเสร็จธรรมดา'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-white">
                      {parseFloat(item.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[12px] font-medium ${new Date(item.warranty_expire_date) < new Date()
                        ? 'text-rose-500'
                        : 'text-[#10B981] dark:text-[#34D399]'
                        }`}>
                        {new Date(item.warranty_expire_date).toLocaleDateString('th-TH')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => navigate(`/purchases/${item.id}`)}
                        className="p-1.5 text-slate-400 hover:text-[#1D4ED8] hover:bg-[#EFF6FF] dark:hover:bg-indigo-900/30 rounded-md transition-all"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {currentItems.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900">
              <FileText size={40} className="mx-auto mb-3 opacity-20" />
              <p>ไม่พบรายการคำสั่งซื้อ</p>
            </div>
          )}
        </div>

        {/* Pagination Section */}
        {filteredPurchases.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>แสดง</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded px-2 py-1 outline-none focus:border-[#1D4ED8]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>รายการต่อหน้า</span>
              <span className="hidden sm:inline-block ml-2 border-l border-slate-300 dark:border-slate-700 pl-4">
                แสดงลำดับที่ {startIndex + 1} ถึง {Math.min(startIndex + itemsPerPage, filteredPurchases.length)} จากทั้งหมด {filteredPurchases.length} รายการ
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                หน้า {currentPage} / {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}