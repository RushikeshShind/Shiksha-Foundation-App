import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Platform } from '@ionic/angular'; // For platform detection

// Define the Bill interface
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
  id?: string; // Optional for new bills before saving
}

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = 'https://shiksha-backend.onrender.com/api/bills';

  constructor(
    private http: HttpClient,
    private platform: Platform // For platform detection
  ) {}

  // Save a new bill
  saveBill(bill: Bill): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/add`, bill);
  }

  // Fetch all bills
  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiUrl}`);
  }

  // Download a bill as a PDF (handles both web and mobile)
  async downloadBillPDF(billId: string): Promise<void> {
    const pdfUrl = `${this.apiUrl}/download/${billId}`;

    if (this.platform.is('capacitor')) {
      // Mobile logic
      await this.downloadPdfMobile(pdfUrl, `Bill_${billId}.pdf`);
    } else {
      // Web logic
      this.downloadPdfWeb(pdfUrl, `Bill_${billId}.pdf`);
    }
  }

  private async downloadPdfMobile(pdfUrl: string, fileName: string) {
    try {
      // Fetch PDF as Blob using Capacitor HTTP
      const response = await fetch(pdfUrl);
      const blob = await response.blob();

      // Convert Blob to Base64
      const base64Data = await this.blobToBase64(blob);

      // Save to device storage
      const fileResult = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });

      // Open the PDF with the system viewer
      await FileOpener.open({
        filePath: fileResult.uri,
        contentType: 'application/pdf'
      });

    } catch (error) {
      console.error('Mobile PDF download failed:', error);
      throw error;
    }
  }

  private downloadPdfWeb(pdfUrl: string, fileName: string) {
    // Web: Use standard HTTP client and trigger file download
    this.http.get(pdfUrl, { responseType: 'blob' }).subscribe((blob: Blob) => {
      const fileURL = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data URL prefix
      };
      reader.readAsDataURL(blob);
    });
  }
}