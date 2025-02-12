import { Component, OnInit } from '@angular/core';
import { BillService } from '../bill/bill.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

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
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule, // ✅ Required for API calls
  ],
  providers: [BillService] // ✅ Provide locally like StudentsComponent
})
export class BillComponent implements OnInit {
  bills: Bill[] = [];
  bill: Bill = this.getEmptyBill();
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private billService: BillService) {}

  ngOnInit(): void {
    this.loadBills();
  }

  loadBills(): void {
    this.isLoading = true;
    this.billService.getBills().subscribe({
      next: (bills) => {
        // Sort bills by date in descending order (newest first)
        this.bills = bills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        console.log('Fetched Bills:', this.bills);
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

  // ✅ Fix: Add convertAmountToWords method
  convertAmountToWords(): void {
    if (this.bill.amountNumber > 0) {
      this.bill.amountWords = this.numberToWords(this.bill.amountNumber);
    }
  }

  // ✅ Utility function to convert numbers to words
  numberToWords(amount: number): string {
    const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    return words[amount] || amount.toString();
  }

  // ✅ Fix: Add viewBill method
  async viewBill(billId?: string): Promise<void> {
    if (!billId) {
      alert('Bill ID is required for viewing.');
      return;
    }
    try {
      await this.billService.viewBillPDF(billId);
    } catch (error) {
      console.error('Error opening PDF:', error);
      alert('Failed to open the PDF.');
    }
  }

  // ✅ Fix: Add downloadPDF method
  async downloadPDF(billId?: string): Promise<void> {
    if (!billId) {
      alert('Bill ID is required for downloading.');
      return;
    }
    try {
      await this.billService.downloadBillPDF(billId);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download the PDF.');
    }
  }

  // ✅ Export Bills to Excel
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
