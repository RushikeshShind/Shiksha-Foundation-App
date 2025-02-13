import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = 'https://shiksha-backend.onrender.com/api/bills';

  constructor(private http: HttpClient) {}

  // ✅ Fetch Logged-In User (Fix: Returns Observable)
  getLoggedInUser(): Observable<{ name: string }> {
    const volunteerName = localStorage.getItem('volunteerName') || 'defaultUser'; // ✅ Get from storage
    const apiUrl = `https://shiksha-backend.onrender.com/api/volunteers/${volunteerName}`;
  
    return this.http.get<{ name: string }>(apiUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('API Error fetching logged-in user:', error);
        let errorMessage = 'An unexpected error occurred. Please try again.';
  
        if (error.status === 0) {
          errorMessage = 'Network error - Please check your internet connection or backend server.';
        } else if (error.status === 404) {
          errorMessage = 'Volunteer not found - Please log in again.';
        } else if (error.status === 500) {
          errorMessage = 'Internal Server Error - Try again later.';
        }
  
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  

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

  // ✅ View PDF Bill
  viewBillPDF(billId: string): Observable<string> {
    const pdfUrl = `${this.apiUrl}/download/${billId}`;
    return this.http.get(pdfUrl, { responseType: 'blob' }).pipe(
      map((blob) => {
        if (!blob || blob.size === 0) {
          throw new Error('Empty response received.');
        }
        return window.URL.createObjectURL(blob);
      }),
      catchError((error) => throwError(() => new Error('Failed to fetch the bill PDF.')))
    );
  }

  // ✅ Download Bill PDF
  downloadBillPDF(billId: string): void {
    const pdfUrl = `${this.apiUrl}/download/${billId}`;
    this.http.get(pdfUrl, { responseType: 'blob' }).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bill_${billId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error downloading PDF:', error);
        alert('Failed to download the PDF.');
      }
    );
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

  // ✅ Handle Errors
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
