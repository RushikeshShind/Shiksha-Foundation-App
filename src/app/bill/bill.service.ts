import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { FileOpener } from '@capacitor-community/file-opener';
import { Filesystem, Directory } from '@capacitor/filesystem';

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

  // 📌 Download Bill as PDF
  async downloadBillPDF(billId: string): Promise<void> {
    const pdfUrl = `${this.apiUrl}/download/${billId}`;
    const fileName = `Bill_${billId}.pdf`;

    try {
      if (this.platform.is('capacitor')) {
        await this.downloadPdfMobile(pdfUrl, fileName);
      } else {
        this.downloadPdfWeb(pdfUrl, fileName);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again later.');
    }
  }

 // 📌 Mobile PDF Download
private async downloadPdfMobile(pdfUrl: string, fileName: string) {
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

    // Get the file path
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


  // 📌 Web Download
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
