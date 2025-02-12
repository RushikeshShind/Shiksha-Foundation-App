import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { DomSanitizer,SafeResourceUrl } from '@angular/platform-browser';

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

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = 'https://shiksha-backend.onrender.com/api/bills';
  

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  // ✅ Fetch All Bills
  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Save a Bill
  saveBill(bill: Bill): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/add`, bill).pipe(
      catchError(this.handleError)
    );
  }

 // ✅ Fetch the PDF and return a safe URL
 viewBillPDF(billId: string): Observable<SafeResourceUrl> {
  const pdfUrl = `${this.apiUrl}/download/${billId}`;

  return this.http.get(pdfUrl, { responseType: 'blob' }).pipe(
    map((blob) => {
      console.log('Received PDF Blob:', blob); // ✅ Debugging

      if (!blob || blob.size === 0) {
        throw new Error('Empty response received.');
      }

      const pdfBlobUrl = window.URL.createObjectURL(blob);
      console.log('Generated PDF Blob URL:', pdfBlobUrl); // ✅ Debugging

      return this.sanitizer.bypassSecurityTrustResourceUrl(pdfBlobUrl);
    }),
    catchError((error) => {
      console.error('Error fetching PDF:', error);
      return throwError(() => new Error('Failed to fetch the bill PDF.'));
    })
  );
}

  
  

  // ✅ Download Bill PDF - Properly fetches and downloads the file
  downloadBillPDF(billId: string): void {
    const pdfUrl = `${this.apiUrl}/download/${billId}`;
    this.http.get(pdfUrl, { responseType: 'blob' }).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bill_${billId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, (error) => {
      console.error('Error downloading PDF:', error);
      alert('Failed to download the PDF.');
    });
  }

  // ✅ Export Bills to Excel
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

  // ✅ Handle Errors Properly
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (error.status === 0) {
      errorMessage = 'Network error - please check if the backend server is running.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    console.error('Error in HTTP request:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
