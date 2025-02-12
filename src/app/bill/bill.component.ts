import { Component, OnInit } from '@angular/core';
import { BillService } from '../bill/bill.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  providers: [BillService]
})
export class BillComponent implements OnInit {
convertAmountToWords() {
throw new Error('Method not implemented.');
}
  bills: Bill[] = [];
  bill: Bill = this.getEmptyBill();
  isLoading = false;
  errorMessage: string | null = null;
  pdfUrl: SafeResourceUrl | null = null;

  constructor(private billService: BillService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadBills();
  }

  loadBills(): void {
    this.isLoading = true;
    this.billService.getBills().subscribe({
      next: (bills) => {
        this.bills = bills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching bills:', err);
        this.errorMessage = 'Failed to load bills. Please try again.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  submitBill(): void {
    if (!this.isValidBill(this.bill)) {
      alert('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;
    this.billService.saveBill(this.bill).subscribe({
      next: (savedBill) => {
        alert('Bill saved successfully!');
        this.bills.push(savedBill);
        this.bill = this.getEmptyBill();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error saving bill:', err);
        this.errorMessage = 'Failed to save the bill. Please try again.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  downloadExcel(): void {
    if (this.bills.length === 0) {
      alert('No bills available to export.');
      return;
    }
    try {
      this.billService.downloadExcel(this.bills);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export Excel file.');
    }
  }

  async viewBill(billId?: string): Promise<void> {
    if (!billId) {
      alert('Bill ID is required for viewing.');
      return;
    }
    const rawUrl = `https://shiksha-backend.onrender.com/api/bills/download/${billId}`;
    console.log('Generated PDF URL:', rawUrl);
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  }

  async downloadPDF(billId?: string): Promise<void> {
    if (!billId) {
      alert('Bill ID is required for downloading.');
      return;
    }
    window.open(`https://shiksha-backend.onrender.com/api/bills/download/${billId}`, '_blank');
  }

  private getEmptyBill(): Bill {
    return {
      date: '',
      name: '',
      msName: '',
      amountNumber: 0,
      amountWords: '',
      address: '',
      mobileNo: '',
      email: '',
      pancardNo: '',
      purpose: '',
      transactionId: '',
      chequeDetails: '',
      volunteerName: '',
      remark: ''
    };
  }

  private isValidBill(bill: Bill): boolean {
    return bill.date.trim() !== '' && bill.name.trim() !== '' && bill.amountNumber > 0;
  }
}
