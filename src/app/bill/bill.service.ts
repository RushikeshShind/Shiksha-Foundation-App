import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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

@Injectable()
export class BillService {
  viewBillPDF(billId: string) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'https://shiksha-backend.onrender.com/api/bills';

  constructor(private http: HttpClient) {}

  // ✅ Save a new bill
  saveBill(bill: Bill): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/add`, bill).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Fetch all bills
  getBills(): Observable<Bill[]> {
    console.log('Fetching bills from:', this.apiUrl);
    return this.http.get<Bill[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Download PDF
  async downloadBillPDF(billId: string): Promise<void> {
    const pdfUrl = `${this.apiUrl}/download/${billId}`;
    console.log('Downloading PDF from:', pdfUrl);
    window.open(pdfUrl, '_blank');
  }

  // ✅ Export to Excel
  downloadExcel(bills: Bill[]): void {
    if (bills.length === 0) {
      alert('No bills available to export.');
      return;
    }
  
    try {
      console.log('📝 Preparing data for export...', bills);
  
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
        bills.map(bill => ({
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
          'Purpose': bill.purpose,
          'Remark': bill.remark,
          'Volunteer': bill.volunteerName
        }))
      );
  
      console.log('📊 Worksheet created:', ws);
  
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bills');
  
      console.log('📁 Writing file: Bills.xlsx...');
      XLSX.writeFile(wb, 'Bills.xlsx');
  
      console.log('✅ Excel file exported successfully!');
    } catch (error) {
      console.error('❌ Error exporting Excel:', error);
      alert('Failed to export Excel file. Check console for details.');
    }
  }

  // ✅ Handle API errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (error.status === 0) {
      errorMessage = 'Network error - please check if the backend server is running.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
