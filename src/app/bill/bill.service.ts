import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
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

  constructor(
    private http: HttpClient,
    private platform: Platform,
    private inAppBrowser: InAppBrowser,
    private file: File,
    private fileTransfer: FileTransfer
  ) {}

  saveBill(bill: Bill): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/add`, bill);
  }

  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiUrl}`);
  }

  async viewBillPDF(billId: string): Promise<void> {
    const pdfUrl = `${this.apiUrl}/download/${billId}`;
    if (this.platform.is('cordova')) {
      this.inAppBrowser.create(pdfUrl, '_system');
    } else {
      window.open(pdfUrl, '_blank');
    }
  }

  async downloadBillPDF(billId: string): Promise<void> {
    const pdfUrl = `${this.apiUrl}/download/${billId}`;
    if (this.platform.is('cordova')) {
      const fileTransfer: FileTransferObject = this.fileTransfer.create();
      const filePath = this.file.externalRootDirectory + 'Download/' + `Bill_${billId}.pdf`;

      try {
        await fileTransfer.download(pdfUrl, filePath);
        alert('PDF downloaded successfully! Check the Downloads folder.');
      } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Failed to download the PDF.');
      }
    } else {
      window.open(pdfUrl, '_blank');
    }
  }

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
