import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Platform } from '@ionic/angular'; // For platform detection
import { Browser } from '@capacitor/browser'; // Import Capacitor Browser plugin
import { FileOpener } from '@capacitor-community/file-opener'; // Import Capacitor FileOpener plugin
import { Directory, Filesystem } from '@capacitor/filesystem'; // For filesystem access

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

  constructor(
    private http: HttpClient,
    private platform: Platform
  ) {}

  // Save a new bill
  saveBill(bill: Bill): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/add`, bill);
  }

  // Fetch all bills
  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiUrl}`);
  }

  // View Bill Method - Open PDF in Browser
  async viewBillPDF(billId: string): Promise<void> {
    const pdfUrl = `${this.apiUrl}/download/${billId}`;
    if (this.platform.is('capacitor')) {
      // Mobile logic - open the PDF in browser
      await Browser.open({ url: pdfUrl });
    } else {
      // Web logic - open the PDF in browser
      window.open(pdfUrl, '_blank');
    }
  }

  // Download a bill as a PDF (handles both web and mobile)
  async downloadBillPDF(billId: string): Promise<void> {
    const pdfUrl = `${this.apiUrl}/download/${billId}`;

    try {
      if (this.platform.is('capacitor')) {
        // Mobile logic - handle PDF download
        await this.downloadPdfMobile(pdfUrl, `Bill_${billId}.pdf`);
      } else {
        // Web logic - handle PDF download
        this.downloadPdfWeb(pdfUrl, `Bill_${billId}.pdf`);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again later.');
    }
  }

  // Download PDF for mobile
  private async downloadPdfMobile(pdfUrl: string, fileName: string) {
    try {
      // Fetch the PDF file as a Blob
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch PDF: ' + response.statusText);
      }
      const blob = await response.blob();

      // Convert the Blob to Base64
      const base64Data = await this.blobToBase64(blob);

      // Save to device storage (Documents directory)
      const fileResult = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents, // Saving to Documents folder
        recursive: true
      });

      console.log('File saved successfully:', fileResult);

      // Open the saved PDF using FileOpener
      await FileOpener.open({
        filePath: fileResult.uri,
        contentType: 'application/pdf'
      });

    } catch (error) {
      console.error('Error during PDF download or file handling on mobile:', error);
      alert('Failed to download PDF on mobile. Please try again.');
      throw error;  // Rethrow for further handling
    }
  }

  // Web download logic
  private downloadPdfWeb(pdfUrl: string, fileName: string) {
    this.http.get(pdfUrl, { responseType: 'blob' }).subscribe(
      (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      (error) => {
        console.error('Web PDF download failed:', error);
        alert('Failed to download PDF. Please try again.');
      }
    );
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
