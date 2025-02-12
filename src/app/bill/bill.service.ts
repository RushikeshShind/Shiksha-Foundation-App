import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as XLSX from 'xlsx';

interface Bill {
  id?: string;
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
}
declare var cordova: any;  // Declare the `cordova` variable

declare const window: any; // Declare window as `any` to avoid TypeScript errors

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = 'https://shiksha-backend.onrender.com/api/bills';

  constructor(private http: HttpClient) {}

  // Get Bills from the backend
  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Save Bill to the backend
  saveBill(bill: Bill): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/add`, bill).pipe(
      catchError(this.handleError)
    );
  }

  // View Bill PDF
  viewBillPDF(billId: string): Promise<void> {
    const pdfUrl = `${this.apiUrl}/download/${billId}`;
    // Open in the default browser for APK or in a new window/tab for web
    if (window.cordova && window.cordova.InAppBrowser) {
      window.cordova.InAppBrowser.open(pdfUrl, '_system', 'location=yes');
    } else {
      window.open(pdfUrl, '_blank');
    }
    return Promise.resolve();
  }

  // Download Bill PDF
  downloadBillPDF(billId: string): Promise<void> {
    const pdfUrl = `${this.apiUrl}/download/${billId}`;
    // Open in the default browser for APK or in a new window/tab for web
    if (window.cordova && window.cordova.InAppBrowser) {
      window.cordova.InAppBrowser.open(pdfUrl, '_system', 'location=yes');
    } else {
      window.open(pdfUrl, '_blank');
    }
    return Promise.resolve();
  }

  // Export Bills to Excel
  downloadExcel(bills: Bill[]): void {
    if (bills.length === 0) {
      alert('No bills available to export.');
      return;
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      bills.map((bill, index) => ({
        'Sr. No': index + 1,
        'Receipt No.': bill.transactionId,
        'Date': bill.date,
        'Name': bill.name,
        'M/s Name': bill.msName,
        'Mobile No': bill.mobileNo,
        'Email ID': bill.email,
        'Amount': bill.amountNumber,
        'Address': bill.address,
        'Pancard No': bill.pancardNo,
        'Purpose': bill.purpose,
        'Remark': bill.remark || '',
        'Volunteer': bill.volunteerName,
        'Cheque Details': bill.chequeDetails || ''
      }))
    );

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bills');
    XLSX.writeFile(wb, 'Bills.xlsx');
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (error.status === 0) {
      errorMessage = 'Network error - please check if the backend server is running.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
