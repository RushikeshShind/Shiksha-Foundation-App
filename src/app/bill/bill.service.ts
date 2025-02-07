import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { FileOpener } from '@capacitor-community/file-opener';
import { Filesystem, Directory, PermissionStatus } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import * as XLSX from 'xlsx';

interface Bill {
  date: string;
  name: string;
  msName: string;
  amountNumber: number;
  amountWords: string;
  address: string;
  mobileNo: string;
  alternativeNo?: string;
  email: string;
  pancardNo: string;
  purpose: string;
  transactionId: string;
  chequeDetails?: string;
  remark?: string;
  volunteerName: string;
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = 'https://shiksha-backend.onrender.com/api/bills';

  constructor(private http: HttpClient, private platform: Platform) {}

  // 📌 Save a new bill
  saveBill(bill: Bill): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/add`, bill);
  }

  // 📌 Fetch all bills
  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiUrl}`);
  }

  // 📌 View Bill PDF in Browser
  async viewBillPDF(billId: string): Promise<void> {
    const pdfUrl = `${this.apiUrl}/download/${billId}`;
    if (this.platform.is('capacitor')) {
      await Browser.open({ url: pdfUrl });
    } else {
      window.open(pdfUrl, '_blank');
    }
  }

  // ✅ Open PDF in the default web browser (Chrome/Safari/etc.)
  async downloadBillPDF(billId: string): Promise<void> {
    const pdfUrl = `${this.apiUrl}/download/${billId}`;

    if (this.platform.is('capacitor')) {
      // ✅ Open the link in the default browser on mobile
      await Browser.open({ url: pdfUrl });
    } else {
      // ✅ Open in new tab on desktop/web
      window.open(pdfUrl, '_blank');
    }
  }

  // ✅ Ensure Permission Before Download
  async requestStoragePermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true; // Skip for Web

    try {
      const permissionStatus: PermissionStatus = await Filesystem.checkPermissions();
      if (permissionStatus.publicStorage === 'granted') {
        return true;
      }

      // Request permission if not granted
      const request = await Filesystem.requestPermissions();
      if (request.publicStorage !== 'granted') {
        alert('Storage permission is required to download files.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting storage permission:', error);
      alert('Failed to request storage permission.');
      return false;
    }
  }

  // ✅ Updated Mobile PDF Download & Open Function
  private async downloadPdfMobile(pdfUrl: string, fileName: string) {
    const hasPermission = await this.requestStoragePermission();
    if (!hasPermission) return;

    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Failed to fetch PDF');

      const blob = await response.blob();
      const base64Data = await this.blobToBase64(blob);

      // ✅ Save file in "Documents" directory
      const fileResult = await Filesystem.writeFile({
        path: `Download/${fileName}`,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });

      const fileUri = await Filesystem.getUri({ directory: Directory.Documents, path: `Download/${fileName}` });

      console.log('File saved at:', fileUri.uri);

      // ✅ Show popup before opening the file
      if (confirm('Download complete! Click OK to open the PDF.')) {
        await FileOpener.open({
          filePath: fileUri.uri,
          contentType: 'application/pdf'
        });
      }

    } catch (error) {
      console.error('Error opening PDF:', error);
      alert('Failed to download/open PDF. Check permissions.');
    }
  }

  // 📌 Web PDF Download
  private downloadPdfWeb(pdfUrl: string, fileName: string) {
    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF on web:', error);
      alert('Failed to download the PDF. Please try again.');
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // 📌 Generate and Download Excel
  downloadExcel(bills: Bill[]): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(bills.map(bill => ({
      'Sr. No': bill.id,
      'Receipt No.': bill.transactionId,
      'Date': bill.date,
      'Name': bill.name,
      'M/s Name': bill.msName,
      'Mobile No': bill.mobileNo,
      'Email ID': bill.email,
      'Amount': bill.amountNumber,
      'Address': bill.address,
      'Pancard No': bill.pancardNo,
      'Purpose of Donation': bill.purpose,
      'Remark': bill.remark,
      'Volunteer': bill.volunteerName
    })));

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bills');

    XLSX.writeFile(wb, 'Bills.xlsx');
  }
}