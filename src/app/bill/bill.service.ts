import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environment/environment';  // Make sure to update the path if needed

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
  // API Base URL (using environment variable for flexibility)
  private apiUrl = `${environment.apiUrl}/bills`;

  // Set default headers
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {}

  /**
   * Save a new bill
   * @param bill Bill data
   * @returns Observable<Bill>
   */
  saveBill(bill: Bill): Observable<Bill> {
    console.log('Saving bill:', bill);
    return this.http.post<Bill>(`${this.apiUrl}/add`, bill, this.httpOptions)
      .pipe(
        retry(2), // Retry up to 2 times before failing
        catchError(this.handleError)
      );
  }

  /**
   * Fetch all bills
   * @returns Observable<Bill[]>
   */
  getBills(): Observable<Bill[]> {
    console.log('Fetching all bills...');
    return this.http.get<Bill[]>(this.apiUrl)
      .pipe(
        retry(2),  // Retry up to 2 times before failing
        catchError(this.handleError)
      );
  }

  /**
   * Download a bill as a PDF
   * @param billId Bill ID
   * @returns Observable<Blob>
   */
  downloadBillPDF(billId: string): Observable<Blob> {
    console.log(`Downloading bill PDF for ID: ${billId}`);
    return this.http.get(`${this.apiUrl}/download/${billId}`, {
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  /**
   * Error Handling
   * @param error HttpErrorResponse
   * @returns Observable<never>
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMsg = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMsg = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMsg = 'Bad Request! Please check the input data.';
          break;
        case 404:
          errorMsg = 'Resource Not Found! The requested bill does not exist.';
          break;
        case 500:
          errorMsg = 'Server Error! Please try again later.';
          break;
        case 401:
          errorMsg = 'Unauthorized! Please check your authentication.';
          break;
        case 403:
          errorMsg = 'Forbidden! You do not have permission to perform this action.';
          break;
        default:
          errorMsg = `Unexpected Error (${error.status}): ${error.message}`;
      }
    }

    // Log the error message and return it for further handling in the component
    console.error(errorMsg);
    return throwError(() => new Error(errorMsg));
  }
}
