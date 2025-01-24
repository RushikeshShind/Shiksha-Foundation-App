import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  // Update the API URL to point to the new backend
  private apiUrl = 'https://shiksha-backend.onrender.com/api/bills';

  constructor(private http: HttpClient) {}

  // Save a new bill
  saveBill(bill: Bill): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/add`, bill);
  }

  // Fetch all bills
  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiUrl}`);
  }

  // Download a bill as a PDF
  downloadBillPDF(billId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${billId}`, { responseType: 'blob' });
  }
}

// Define the Bill interface
interface Bill {
  vendorName: string;
  address: string;
  adharcard: string;
  phoneNumber: string;
  amount: number;
  id?: string; // Optional for new bills before saving
}