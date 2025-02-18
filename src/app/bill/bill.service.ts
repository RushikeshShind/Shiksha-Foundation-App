import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { AuthService } from '../auth.service'; // Import AuthService

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = 'https://shiksha-backend.onrender.com/api/bills';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Request permissions for storage (Android)
  async requestPermissions() {
    const perm = await Filesystem.requestPermissions();
    if (perm.publicStorage !== 'granted') {
      alert('Storage permission is required to download files.');
    }
  }

  // ✅ Fetch All Bills (Anyone can access)
  getBills(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Save a Bill (Anyone can save)
  saveBill(bill: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, bill).pipe(
      catchError(this.handleError)
    );
  }

  // ❌ **Restrict View PDF to Admins**
  viewBillPDF(billId: string): Observable<string> {
    if (this.authService.getRole() !== 'admin') {
      return throwError(() => new Error('Access Denied: Only admins can view bill PDFs.'));
    }

    const pdfUrl = `${this.apiUrl}/download/${billId}`;
    return this.http.get(pdfUrl, { responseType: 'blob' }).pipe(
      map((blob) => {
        if (!blob || blob.size === 0) {
          throw new Error('Empty response received.');
        }
        return window.URL.createObjectURL(blob);
      }),
      catchError(() => throwError(() => new Error('Failed to fetch the bill PDF.')))
    );
  }

  // ✅ Download Bill PDF
  downloadBillPDF(
    billId: string,
    onLoading: (isLoading: boolean) => void,
    onSuccess: (filePath: string) => void,
    onError: (error: any) => void
  ): void {
    if (this.authService.getRole() !== 'admin') {
      alert('Access Denied: Only admins can download bill PDFs.');
      return;
    }

    const pdfUrl = `${this.apiUrl}/download/${billId}`;

    onLoading(true); // Show loading indicator

    this.http.get(pdfUrl, { responseType: 'blob' }).subscribe(
      async (blob) => {
        if (blob && blob.size > 0) {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64data = reader.result?.toString().split(',')[1];

            if (base64data) {
              try {
                const filePath = `Bill_${billId}.pdf`;
                await Filesystem.writeFile({
                  path: filePath,
                  data: base64data,
                  directory: Directory.Documents,
                  encoding: Encoding.UTF8
                });

                onLoading(false); // Hide loading indicator
                onSuccess(filePath); // Show success message with file path
              } catch (error) {
                console.error('File saving error:', error);
                alert('Failed to save the PDF.');
                onLoading(false); // Hide loading indicator
                onError(error);
              }
            }
          };
        } else {
          alert('Failed to fetch the bill PDF.');
          onLoading(false); // Hide loading indicator
          onError('Failed to fetch the bill PDF');
        }
      },
      (error) => {
        console.error('Error downloading PDF:', error);
        alert('Failed to download the PDF.');
        onLoading(false); // Hide loading indicator
        onError(error);
      }
    );
  }

  // ✅ Export Bills to Excel (Only Admins can export)
  downloadExcel(bills: any[]): void {
    // Check if the user is an admin
    if (this.authService.getRole() !== 'admin') {
      alert('Access Denied: Only admins can download Excel files.');
      return;
    }

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
        'Cheque Details': bill.chequeDetails || '',
        'Alternative No': bill.alternativeNo || '',
        'Bank Name': bill.bankName || '',
        'Cheque No': bill.chequeNo || '',
        'Cheque Date': bill.chequeDate || ''
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
