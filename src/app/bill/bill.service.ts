import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Platform } from '@ionic/angular'; // For platform detection
import { Browser } from '@capacitor/browser'; // Import Capacitor Browser plugin

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

  saveBill(bill: Bill): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/add`, bill);
  }

  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiUrl}`);
  }

  async downloadBillPDF(billId: string): Promise<void> {
    const pdfUrl = `${this.apiUrl}/download/${billId}`;

    try {
      if (this.platform.is('capacitor')) {
        // Mobile logic: Open the PDF in an external browser
        await this.openPdfInBrowser(pdfUrl);
      } else {
        // Web logic: Trigger the PDF download
        this.downloadPdfWeb(pdfUrl, `Bill_${billId}.pdf`);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again later.');
    }
  }

  private async openPdfInBrowser(pdfUrl: string): Promise<void> {
    try {
      console.log('Opening PDF in browser:', pdfUrl);
      await Browser.open({ url: pdfUrl }); // Open the URL in the browser
    } catch (error) {
      console.error('Error opening PDF in browser:', error);
      alert('Failed to open PDF in browser. Please try again.');
    }
  }

  private downloadPdfWeb(pdfUrl: string, fileName: string): void {
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
        alert('Failed to download PDF on web. Please try again.');
      }
    );
  }
}
