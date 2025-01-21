import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = 'http://localhost:3000/api/bills';

  constructor(private http: HttpClient) {}

  saveBill(bill: Bill): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/add`, bill);
  }

  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiUrl}`);
  }

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