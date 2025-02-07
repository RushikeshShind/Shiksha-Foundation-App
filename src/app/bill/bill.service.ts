import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { FileOpener } from '@capacitor-community/file-opener';
import { Filesystem, Directory, PermissionStatus } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

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

// 📌 Open PDF in the default web browser (Chrome/Safari/etc.)
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

  // 📌 Request Storage Permission Before Download
  private async requestStoragePermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true; // Skip for Web

    const permissionStatus: PermissionStatus = await Filesystem.checkPermissions();
    if (permissionStatus.publicStorage === 'granted') {
      return true;
    } else {
      const request = await Filesystem.requestPermissions();
      if (request.publicStorage !== 'granted') {
        alert('Storage permission is required to download files.');
        return false;
      }
    }
    return true;
  }

  // 📌 Mobile PDF Download (Handles Permissions & File Saving)
  private async downloadPdfMobile(pdfUrl: string, fileName: string) {
    const hasPermission = await this.requestStoragePermission();
    if (!hasPermission) return;

    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Failed to fetch PDF');

      const blob = await response.blob();
      const base64Data = await this.blobToBase64(blob);

      // Save file in the "Documents" directory
      const fileResult = await Filesystem.writeFile({
        path: `Download/${fileName}`,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });

      const fileUri = await Filesystem.getUri({ directory: Directory.Documents, path: `Download/${fileName}` });

      console.log('File saved:', fileUri.uri);

      // ✅ Show popup with "Click to Open" option
      if (confirm('Download complete! Click OK to open the PDF.')) {
        await FileOpener.open({
          filePath: fileUri.uri,
          contentType: 'application/pdf'
        });
      }

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to download PDF on mobile.');
    }
  }

  // 📌 Web PDF Download
  private downloadPdfWeb(pdfUrl: string, fileName: string) {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
